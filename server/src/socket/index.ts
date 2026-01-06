import { Server, Socket } from 'socket.io';
import { gameService } from '../services/gameService.js';
import { roleService } from '../services/roleService.js';
import { playerService } from '../services/playerService.js';
import { StatsService } from '../services/statsService.js';
import { GuessService } from '../services/guessService.js';
import { RoleActionsService } from '../services/roleActionsService.js';
import { RoleActionBonus } from '../services/statsBonusService.js';
import { generateMissions } from '../utils/missionGenerator.js';
import { ROLES, GAME_CONFIG } from '../utils/constants.js';
import { RoleId } from '../types/index.js';
import { db } from '../config/db.js';

interface AuthenticatedSocket extends Socket {
  playerId: number;
  username: string;
  sessionId: string;
}

export function setupSocket(io: Server) {
  const statsService = new StatsService(db);
  const guessService = new GuessService(db);
  const roleActionsService = new RoleActionsService(db);

  // Map pour stocker les timestamps de début de phase débat par partie
  const debateStartTimes = new Map<string, number>();

  // Middleware d'authentification avec pseudo et session
  io.use((socket, next) => {
    const { username, sessionId } = socket.handshake.auth;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return next(new Error('Pseudo manquant'));
    }

    try {
      // Créer ou récupérer le joueur
      const player = playerService.getOrCreatePlayer(username.trim(), sessionId);

      (socket as AuthenticatedSocket).playerId = player.id;
      (socket as AuthenticatedSocket).username = player.username;
      (socket as AuthenticatedSocket).sessionId = player.session_id;

      next();
    } catch (error) {
      next(new Error('Erreur lors de la creation du joueur'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User ${authSocket.username} (${authSocket.playerId}) connected`);

    // Envoyer le sessionId au client pour qu'il le stocke
    socket.emit('session:created', { sessionId: authSocket.sessionId });

    // Rejoindre un lobby
    socket.on('lobby:join', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      socket.join(gameCode);
      const players = gameService.getGamePlayers(game.id);
      const player = players.find(p => p.player_id === authSocket.playerId);

      if (player) {
        socket.to(gameCode).emit('lobby:player-joined', player);
      }

      socket.emit('lobby:updated', players);
    });

    // Quitter un lobby
    socket.on('lobby:leave', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) return;

      gameService.leaveGame(game.id, authSocket.playerId);
      socket.leave(gameCode);
      socket.to(gameCode).emit('lobby:player-left', { playerId: authSocket.playerId });
    });

    // Toggle ready
    socket.on('lobby:ready', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) return;

      try {
        const isReady = gameService.toggleReady(game.id, authSocket.playerId);
        io.to(gameCode).emit('lobby:player-ready', {
          playerId: authSocket.playerId,
          isReady
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Envoyer un message
    socket.on('chat:message', ({ gameCode, content }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) return;

      const message = gameService.saveMessage(game.id, authSocket.playerId, content);
      io.to(gameCode).emit('chat:new-message', message);
    });

    // Démarrer la partie (host only)
    socket.on('game:start', async ({ gameCode }) => {
      console.log(`[GAME START] Received game:start event for game ${gameCode} from player ${authSocket.playerId}`);

      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      if (game.host_id !== authSocket.playerId) {
        socket.emit('error', { message: 'Seul l\'hote peut lancer la partie' });
        return;
      }

      const players = gameService.getGamePlayers(game.id);
      console.log(`[GAME START] Found ${players.length} players:`, players.map(p => `${p.username}(${p.player_id})`).join(', '));

      if (players.length < GAME_CONFIG.MIN_PLAYERS) {
        socket.emit('error', { message: `Il faut au moins ${GAME_CONFIG.MIN_PLAYERS} joueurs` });
        return;
      }

      if (!gameService.areAllPlayersReady(game.id)) {
        socket.emit('error', { message: 'Tous les joueurs doivent etre prets' });
        return;
      }

      // Attribuer les rôles
      const playerIds = players.map(p => p.player_id);
      const roleAssignments = roleService.assignRoles(playerIds);
      console.log(`[GAME START] Role assignments:`, Array.from(roleAssignments.entries()).map(([pid, role]) => `Player ${pid} -> ${role}`).join(', '));

      // Démarrer la partie
      gameService.startGame(game.id, roleAssignments);

      // Notifier tout le lobby que le jeu démarre
      io.to(gameCode).emit('game:status-changed', { status: 'playing' });
      console.log(`[GAME START] Emitted game:status-changed to room ${gameCode}`);

      // Envoyer le rôle à chaque joueur individuellement
      const connectedSockets = await io.in(gameCode).fetchSockets();
      console.log(`[GAME START] Found ${connectedSockets.length} connected sockets in room ${gameCode}`);
      console.log(`[GAME START] Socket player IDs:`, connectedSockets.map(s => (s as any).playerId).join(', '));

      for (const player of players) {
        const roleId = roleAssignments.get(player.player_id) as RoleId;
        const role = ROLES[roleId];

        // Trouver la socket du joueur dans la room
        const playerSocket = connectedSockets.find(s =>
          (s as any).playerId === player.player_id
        );

        if (playerSocket) {
          console.log(`[GAME START] Sending role ${roleId} to player ${player.username}(${player.player_id})`);
          playerSocket.emit('game:started', { role });

          // Si c'est un Droide, lui envoyer 3 missions
          if (roleId === 'droide') {
            const missions = generateMissions(3);
            playerSocket.emit('role:droide-missions', { missions });
            console.log(`[GAME START] Sent ${missions.length} missions to Droide ${player.username}`);
          }
        } else {
          console.warn(`[GAME START] ❌ Socket not found for player ${player.player_id} (${player.username})`);
        }
      }

      console.log(`[GAME START] ✅ Role distribution completed for game ${gameCode}`);
      // Les joueurs voient leur rôle, l'hôte devra cliquer pour passer à la phase stats
    });

    // L'hôte lance la phase de soumission des stats
    socket.on('game:start-stats', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      // Vérifier que c'est bien l'hôte
      if (game.host_id !== authSocket.playerId) {
        socket.emit('error', { message: 'Seul l\'hôte peut lancer la phase de stats' });
        return;
      }

      // Vérifier que la partie est en cours et sans phase
      if (game.status !== 'playing' || game.current_phase !== null) {
        socket.emit('error', { message: 'La partie n\'est pas dans le bon état' });
        return;
      }

      // Passer à la phase stats
      gameService.startStatsPhase(game.id);
      io.to(gameCode).emit('game:phase-change', { phase: 'stats' });
    });

    // Soumettre les stats LoL
    socket.on('stats:submit', ({ gameCode, stats }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      try {
        // Enregistrer les stats
        statsService.submitStats(game.id, authSocket.playerId, stats);

        // Compter combien de joueurs ont soumis
        const { total, submitted } = statsService.countSubmittedStats(game.id);

        // Informer tous les joueurs
        io.to(gameCode).emit('stats:submitted', {
          playerId: authSocket.playerId,
          total,
          submitted
        });

        // Si tous ont soumis, passer à la phase débat
        if (statsService.allStatsSubmitted(game.id)) {
          // Mettre à jour le statut de la partie
          gameService.startDebatePhase(game.id);

          const debateEndTime = new Date(Date.now() + GAME_CONFIG.DEBATE_DURATION_MS).toISOString();

          // Stocker le timestamp de début de débat pour Double-Face
          debateStartTimes.set(gameCode, Date.now());

          io.to(gameCode).emit('stats:all-submitted');
          io.to(gameCode).emit('game:phase-change', { phase: 'debate', endTime: debateEndTime });

          // Programmer le passage à la phase de vote
          setTimeout(() => {
            const updatedGame = gameService.getGameByCode(gameCode);
            if (updatedGame && updatedGame.current_phase === 'debate') {
              gameService.startVotePhase(updatedGame.id);
              const voteEndTime = new Date(Date.now() + GAME_CONFIG.VOTE_DURATION_MS).toISOString();
              io.to(gameCode).emit('game:phase-change', { phase: 'vote', endTime: voteEndTime });

              // Programmer la fin du vote
              setTimeout(() => {
                endVotePhase(gameCode, game.id, io);
              }, GAME_CONFIG.VOTE_DURATION_MS);
            }
          }, GAME_CONFIG.DEBATE_DURATION_MS);
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Soumettre les devinettes de rôles
    socket.on('guesses:submit', ({ gameCode, guesses }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      try {
        // Valider que le joueur a deviné pour tous les autres joueurs
        const players = gameService.getGamePlayers(game.id);
        const otherPlayers = players.filter(p => p.player_id !== authSocket.playerId);

        if (guesses.length !== otherPlayers.length) {
          socket.emit('error', { message: 'Tu dois deviner le rôle de tous les joueurs' });
          return;
        }

        // Enregistrer les devinettes
        guessService.submitGuesses(game.id, authSocket.playerId, guesses);

        // Informer tous les joueurs
        io.to(gameCode).emit('guesses:received', { guesserId: authSocket.playerId });

        // Vérifier si tout le monde a soumis ses devinettes
        if (guessService.haveAllPlayersGuessed(game.id)) {
          endGuessPhase(gameCode, game.id, io, guessService);
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Double-Face se révèle
    socket.on('role:reveal-double-face', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      try {
        // Vérifier que le joueur a le rôle Double-Face
        const players = gameService.getGamePlayers(game.id);
        const player = players.find(p => p.player_id === authSocket.playerId);

        if (!player || player.role !== 'double_face') {
          socket.emit('error', { message: 'Tu n\'es pas Double-Face' });
          return;
        }

        // Vérifier que la partie est bien en phase débat
        if (game.current_phase !== 'debate') {
          socket.emit('error', { message: 'Tu ne peux te révéler qu\'en phase de débat' });
          return;
        }

        // Vérifier que le timer de 30 secondes n'est pas écoulé
        const debateStartTime = debateStartTimes.get(gameCode);
        if (!debateStartTime) {
          socket.emit('error', { message: 'Erreur: timestamp de début non trouvé' });
          return;
        }

        const elapsedTime = Date.now() - debateStartTime;
        const DOUBLE_FACE_TIMER = 30 * 1000; // 30 secondes

        if (elapsedTime > DOUBLE_FACE_TIMER) {
          socket.emit('error', { message: 'Le délai de 30 secondes est écoulé' });
          return;
        }

        // Vérifier que Double-Face ne s'est pas déjà révélé
        if (roleActionsService.hasDoubleFaceRevealed(game.id, authSocket.playerId)) {
          socket.emit('error', { message: 'Tu t\'es déjà révélé' });
          return;
        }

        // Enregistrer l'action
        roleActionsService.recordAction(game.id, authSocket.playerId, 'double_face_reveal');

        // Informer tous les joueurs
        io.to(gameCode).emit('role:double-face-revealed', {
          playerId: authSocket.playerId,
          username: authSocket.username
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Droide complète une mission
    socket.on('role:complete-droide-mission', ({ gameCode, missionId }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      try {
        // Vérifier que le joueur a le rôle Droide
        const players = gameService.getGamePlayers(game.id);
        const player = players.find(p => p.player_id === authSocket.playerId);

        if (!player || player.role !== 'droide') {
          socket.emit('error', { message: 'Tu n\'es pas le Droide' });
          return;
        }

        // Enregistrer la mission complétée
        roleActionsService.recordAction(game.id, authSocket.playerId, 'droide_mission_completed', {
          missionId
        });

        // Confirmer au joueur
        socket.emit('role:action-recorded', {
          playerId: authSocket.playerId,
          actionType: 'droide_mission_completed'
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // L'hôte passe de la révélation des rôles à la phase de jeu LoL
    socket.on('roles:host-continue', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      // Vérifier que c'est bien l'hôte
      if (game.host_id !== authSocket.playerId) {
        socket.emit('error', { message: 'Seul l\'hôte peut passer à l\'étape suivante' });
        return;
      }

      // Informer tous les joueurs de passer à la phase de jeu
      io.to(gameCode).emit('roles:continue-to-game');
    });

    // L'hôte skip la phase de débat pour passer au vote
    socket.on('debate:host-skip', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      // Vérifier que c'est bien l'hôte
      if (game.host_id !== authSocket.playerId) {
        socket.emit('error', { message: 'Seul l\'hôte peut passer au vote' });
        return;
      }

      // Vérifier qu'on est bien en phase débat
      if (game.current_phase !== 'debate') {
        socket.emit('error', { message: 'La partie n\'est pas en phase de débat' });
        return;
      }

      // Passer à la phase de vote
      gameService.startVotePhase(game.id);
      const voteEndTime = new Date(Date.now() + GAME_CONFIG.VOTE_DURATION_MS).toISOString();
      io.to(gameCode).emit('game:phase-change', { phase: 'vote', endTime: voteEndTime });

      // Programmer la fin du vote (qui déclenche endGuessPhase)
      setTimeout(() => {
        // Vérifier si tous les joueurs ont voté
        if (guessService.haveAllPlayersGuessed(game.id)) {
          endGuessPhase(gameCode, game.id, io, guessService);
        }
      }, GAME_CONFIG.VOTE_DURATION_MS);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`User ${authSocket.username} disconnected`);
    });
  });
}

// Fonction pour terminer automatiquement la phase de vote
function endVotePhase(gameCode: string, gameId: number, io: Server) {
  const game = gameService.getGameByCode(gameCode);
  if (!game || game.current_phase !== 'vote') {
    return;
  }

  const guessServiceInstance = new GuessService(db);

  // Vérifier si tout le monde a soumis ses guesses
  if (guessServiceInstance.haveAllPlayersGuessed(gameId)) {
    // Si oui, terminer normalement
    endGuessPhase(gameCode, gameId, io, guessServiceInstance);
  } else {
    // Sinon, forcer la fin du vote et terminer avec les guesses disponibles
    endGuessPhase(gameCode, gameId, io, guessServiceInstance);
  }
}

function endGuessPhase(gameCode: string, gameId: number, io: Server, guessService: GuessService) {
  const players = gameService.getGamePlayers(gameId);
  const guesses = guessService.getGameGuesses(gameId);

  // Créer une map des rôles réels des joueurs
  const playerRoles = new Map<number, string>();
  players.forEach(p => {
    if (p.role) {
      playerRoles.set(p.player_id, p.role);
    }
  });

  // Calculer la précision des devinettes pour chaque joueur
  const guessAccuracy = new Map<number, { correct: number; total: number; accuracy: number }>();
  players.forEach(p => {
    const accuracyData = guessService.calculateGuesserAccuracy(gameId, p.player_id, playerRoles);
    const accuracy = accuracyData.total > 0 ? (accuracyData.correct / accuracyData.total) * 100 : 0;
    guessAccuracy.set(p.player_id, { ...accuracyData, accuracy });
  });

  // Récupérer les stats LoL de tous les joueurs
  const statsServiceInstance = new StatsService(db);
  const allStats = statsServiceInstance.getGameStats(gameId);
  const playerStatsMap = new Map();
  allStats.forEach(stat => {
    playerStatsMap.set(stat.player_id, stat);
  });

  // Récupérer les actions spéciales de tous les joueurs
  const roleActionsServiceInstance = new RoleActionsService(db);
  const roleActionsMap = new Map<number, RoleActionBonus>();

  players.forEach(p => {
    const actions: RoleActionBonus = {};

    // Vérifier si Double-Face s'est révélé
    if (p.role === 'double_face') {
      actions.doubleFaceRevealed = roleActionsServiceInstance.hasDoubleFaceRevealed(gameId, p.player_id);
    }

    // Compter les missions Droide complétées
    if (p.role === 'droide') {
      actions.droideMissionsCompleted = roleActionsServiceInstance.countDroideMissionsCompleted(gameId, p.player_id);
    }

    roleActionsMap.set(p.player_id, actions);
  });

  // Préparer les données pour le calcul des points
  const playerRolesList = players.map(p => ({
    userId: p.player_id,
    role: p.role as RoleId
  }));

  // Calculer les points avec devinettes, stats LoL ET actions spéciales
  const pointsMap = roleService.calculatePoints(playerRolesList, guessAccuracy, playerStatsMap, roleActionsMap);

  // Terminer la partie et sauvegarder les points
  const simplifiedPointsMap = new Map<number, number>();
  pointsMap.forEach((value, key) => {
    simplifiedPointsMap.set(key, value.total);
  });
  gameService.endGame(gameId, simplifiedPointsMap);

  // Préparer les résultats des devinettes pour chaque joueur
  const guessResults = players.map(p => {
    const playerGuesses = guesses.filter(g => g.guesser_id === p.player_id);

    const guessDetails = playerGuesses.map(g => {
      const target = players.find(pl => pl.player_id === g.target_id);
      const actualRole = playerRoles.get(g.target_id) || 'unknown';

      return {
        targetId: g.target_id,
        targetUsername: target?.username || 'Unknown',
        guessedRole: g.guessed_role,
        actualRole,
        isCorrect: g.guessed_role === actualRole
      };
    });

    const accuracy = guessAccuracy.get(p.player_id) || { correct: 0, total: 0, accuracy: 0 };

    return {
      guesserId: p.player_id,
      guesserUsername: p.username,
      guesses: guessDetails,
      correctGuesses: accuracy.correct,
      totalGuesses: accuracy.total,
      accuracy: accuracy.accuracy
    };
  });

  const playerPoints = players.map(p => {
    const pointData = pointsMap.get(p.player_id) || { total: 0, base: 0, guessBonus: 0, statsBonus: 0 };
    return {
      userId: p.player_id,
      username: p.username,
      role: p.role!,
      points: pointData.total,
      breakdown: {
        base: pointData.base,
        guessBonus: pointData.guessBonus,
        statsBonus: pointData.statsBonus
      }
    };
  });

  const impostor = players.find(p => p.role === 'imposteur');

  io.to(gameCode).emit('game:ended', {
    players: players.map(p => ({ ...p, role: p.role! })),
    guessResults,
    points: playerPoints,
    impostorId: impostor?.player_id || 0,
    playerStats: allStats
  });
}
