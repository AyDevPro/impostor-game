import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { gameService } from '../services/gameService.js';
import { roleService } from '../services/roleService.js';
import { authService } from '../services/authService.js';
import { ROLES, GAME_CONFIG } from '../utils/constants.js';
import { RoleId } from '../types/index.js';

interface AuthenticatedSocket extends Socket {
  userId: number;
  username: string;
}

export function setupSocket(io: Server) {
  // Middleware d'authentification
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token manquant'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: number };
      const user = authService.getUser(decoded.userId);

      if (!user) {
        return next(new Error('Utilisateur non trouve'));
      }

      (socket as AuthenticatedSocket).userId = decoded.userId;
      (socket as AuthenticatedSocket).username = user.username;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User ${authSocket.username} (${authSocket.userId}) connected`);

    // Rejoindre un lobby
    socket.on('lobby:join', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      socket.join(gameCode);
      const players = gameService.getGamePlayers(game.id);
      const player = players.find(p => p.user_id === authSocket.userId);

      if (player) {
        socket.to(gameCode).emit('lobby:player-joined', player);
      }

      socket.emit('lobby:updated', players);
    });

    // Quitter un lobby
    socket.on('lobby:leave', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) return;

      gameService.leaveGame(game.id, authSocket.userId);
      socket.leave(gameCode);
      socket.to(gameCode).emit('lobby:player-left', { playerId: authSocket.userId });
    });

    // Toggle ready
    socket.on('lobby:ready', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) return;

      try {
        const isReady = gameService.toggleReady(game.id, authSocket.userId);
        io.to(gameCode).emit('lobby:player-ready', {
          playerId: authSocket.userId,
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

      const message = gameService.saveMessage(game.id, authSocket.userId, content);
      io.to(gameCode).emit('chat:new-message', message);
    });

    // Démarrer la partie (host only)
    socket.on('game:start', ({ gameCode }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Partie introuvable' });
        return;
      }

      if (game.host_id !== authSocket.userId) {
        socket.emit('error', { message: 'Seul l\'hote peut lancer la partie' });
        return;
      }

      const players = gameService.getGamePlayers(game.id);

      if (players.length < GAME_CONFIG.MIN_PLAYERS) {
        socket.emit('error', { message: `Il faut au moins ${GAME_CONFIG.MIN_PLAYERS} joueurs` });
        return;
      }

      if (!gameService.areAllPlayersReady(game.id)) {
        socket.emit('error', { message: 'Tous les joueurs doivent etre prets' });
        return;
      }

      // Attribuer les rôles
      const playerIds = players.map(p => p.user_id);
      const roleAssignments = roleService.assignRoles(playerIds);

      // Démarrer la partie
      gameService.startGame(game.id, roleAssignments);

      const phaseEndTime = new Date(Date.now() + GAME_CONFIG.DEBATE_DURATION_MS).toISOString();

      // Envoyer le rôle à chaque joueur individuellement
      for (const player of players) {
        const roleId = roleAssignments.get(player.user_id) as RoleId;
        const role = ROLES[roleId];

        // Trouver la socket du joueur
        const playerSockets = io.sockets.sockets;
        playerSockets.forEach((s) => {
          if ((s as AuthenticatedSocket).userId === player.user_id) {
            s.emit('game:started', { role, phaseEndTime });
          }
        });
      }

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
    });

    // Voter
    socket.on('vote:cast', ({ gameCode, targetId }) => {
      const game = gameService.getGameByCode(gameCode);
      if (!game) return;

      try {
        gameService.castVote(game.id, authSocket.userId, targetId);
        io.to(gameCode).emit('vote:received', { oderId: authSocket.userId });

        // Vérifier si tout le monde a voté
        if (gameService.haveAllPlayersVoted(game.id)) {
          endVotePhase(gameCode, game.id, io);
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`User ${authSocket.username} disconnected`);
    });
  });
}

function endVotePhase(gameCode: string, gameId: number, io: Server) {
  const players = gameService.getGamePlayers(gameId);
  const votes = gameService.getVotes(gameId);

  // Préparer les données pour le calcul des points
  const playerRoles = players.map(p => ({
    userId: p.user_id,
    role: p.role as RoleId
  }));

  const voteData = votes.map(v => ({
    voterId: v.voter_id,
    targetId: v.target_id
  }));

  // Calculer les points
  const pointsMap = roleService.calculatePoints(playerRoles, voteData);

  // Terminer la partie
  gameService.endGame(gameId, pointsMap);

  // Préparer les résultats
  const voteResults = votes.map(v => {
    const voter = players.find(p => p.user_id === v.voter_id);
    const target = players.find(p => p.user_id === v.target_id);
    return {
      oderId: v.voter_id,
      targetId: v.target_id,
      voterUsername: voter?.username || 'Unknown',
      targetUsername: target?.username || 'Unknown'
    };
  });

  const playerPoints = players.map(p => ({
    userId: p.user_id,
    username: p.username,
    role: p.role!,
    points: pointsMap.get(p.user_id) || 0
  }));

  const impostor = players.find(p => p.role === 'imposteur');
  const votesAgainstImpostor = votes.filter(v => v.target_id === impostor?.user_id).length;
  const impostorCaught = votesAgainstImpostor > votes.length / 2;

  io.to(gameCode).emit('game:ended', {
    players: players.map(p => ({ ...p, role: p.role! })),
    votes: voteResults,
    points: playerPoints,
    impostorId: impostor?.user_id || 0,
    impostorCaught
  });
}
