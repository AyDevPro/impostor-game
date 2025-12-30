import { db } from '../config/db.js';
import { Game, GamePlayer, Message, Vote } from '../types/index.js';
import { generateGameCode } from '../utils/generateCode.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class GameService {
  // Créer une nouvelle partie
  createGame(hostId: number): Game {
    let code: string;
    let attempts = 0;

    // Générer un code unique
    do {
      code = generateGameCode();
      const existing = db.prepare('SELECT id FROM games WHERE code = ?').get(code);
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Error('Impossible de generer un code unique');
    }

    // Créer la partie
    const result = db.prepare(
      'INSERT INTO games (code, host_id) VALUES (?, ?)'
    ).run(code, hostId);

    // Ajouter l'hôte comme joueur
    db.prepare(
      'INSERT INTO game_players (game_id, user_id) VALUES (?, ?)'
    ).run(result.lastInsertRowid, hostId);

    return db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid) as Game;
  }

  // Rejoindre une partie
  joinGame(code: string, userId: number): Game {
    const game = db.prepare('SELECT * FROM games WHERE code = ?').get(code) as Game | undefined;

    if (!game) {
      throw new Error('Partie introuvable');
    }

    if (game.status !== 'lobby') {
      throw new Error('Cette partie a deja commence');
    }

    // Vérifier si le joueur est déjà dans la partie
    const existing = db.prepare(
      'SELECT id FROM game_players WHERE game_id = ? AND user_id = ?'
    ).get(game.id, userId);

    if (existing) {
      return game; // Déjà dans la partie
    }

    // Vérifier le nombre de joueurs
    const playerCount = db.prepare(
      'SELECT COUNT(*) as count FROM game_players WHERE game_id = ?'
    ).get(game.id) as { count: number };

    if (playerCount.count >= GAME_CONFIG.MAX_PLAYERS) {
      throw new Error('La partie est pleine');
    }

    // Ajouter le joueur
    db.prepare(
      'INSERT INTO game_players (game_id, user_id) VALUES (?, ?)'
    ).run(game.id, userId);

    return game;
  }

  // Obtenir une partie par code
  getGameByCode(code: string): Game | null {
    return db.prepare('SELECT * FROM games WHERE code = ?').get(code) as Game || null;
  }

  // Obtenir les joueurs d'une partie
  getGamePlayers(gameId: number): (GamePlayer & { username: string })[] {
    return db.prepare(`
      SELECT gp.*, u.username
      FROM game_players gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.game_id = ?
    `).all(gameId) as (GamePlayer & { username: string })[];
  }

  // Toggle ready status
  toggleReady(gameId: number, userId: number): boolean {
    const player = db.prepare(
      'SELECT is_ready FROM game_players WHERE game_id = ? AND user_id = ?'
    ).get(gameId, userId) as { is_ready: number } | undefined;

    if (!player) {
      throw new Error('Joueur non trouve dans cette partie');
    }

    const newStatus = player.is_ready ? 0 : 1;
    db.prepare(
      'UPDATE game_players SET is_ready = ? WHERE game_id = ? AND user_id = ?'
    ).run(newStatus, gameId, userId);

    return newStatus === 1;
  }

  // Vérifier si tous les joueurs sont prêts
  areAllPlayersReady(gameId: number): boolean {
    const result = db.prepare(`
      SELECT COUNT(*) as total, SUM(is_ready) as ready
      FROM game_players WHERE game_id = ?
    `).get(gameId) as { total: number; ready: number };

    return result.total >= GAME_CONFIG.MIN_PLAYERS && result.total === result.ready;
  }

  // Démarrer la partie
  startGame(gameId: number, roleAssignments: Map<number, string>): void {
    const phaseEndTime = new Date(Date.now() + GAME_CONFIG.DEBATE_DURATION_MS).toISOString();

    // Mettre à jour le statut de la partie
    db.prepare(`
      UPDATE games
      SET status = 'playing', current_phase = 'debate', phase_end_time = ?
      WHERE id = ?
    `).run(phaseEndTime, gameId);

    // Attribuer les rôles
    const updateRole = db.prepare(
      'UPDATE game_players SET role = ? WHERE game_id = ? AND user_id = ?'
    );

    for (const [userId, role] of roleAssignments) {
      updateRole.run(role, gameId, userId);
    }
  }

  // Passer à la phase de vote
  startVotePhase(gameId: number): void {
    const phaseEndTime = new Date(Date.now() + GAME_CONFIG.VOTE_DURATION_MS).toISOString();

    db.prepare(`
      UPDATE games
      SET status = 'voting', current_phase = 'vote', phase_end_time = ?
      WHERE id = ?
    `).run(phaseEndTime, gameId);
  }

  // Enregistrer un vote
  castVote(gameId: number, voterId: number, targetId: number): void {
    // Vérifier si déjà voté
    const existing = db.prepare(
      'SELECT id FROM votes WHERE game_id = ? AND voter_id = ?'
    ).get(gameId, voterId);

    if (existing) {
      throw new Error('Tu as deja vote');
    }

    db.prepare(
      'INSERT INTO votes (game_id, voter_id, target_id) VALUES (?, ?, ?)'
    ).run(gameId, voterId, targetId);
  }

  // Obtenir les votes d'une partie
  getVotes(gameId: number): Vote[] {
    return db.prepare('SELECT * FROM votes WHERE game_id = ?').all(gameId) as Vote[];
  }

  // Vérifier si tous les joueurs ont voté
  haveAllPlayersVoted(gameId: number): boolean {
    const playerCount = db.prepare(
      'SELECT COUNT(*) as count FROM game_players WHERE game_id = ?'
    ).get(gameId) as { count: number };

    const voteCount = db.prepare(
      'SELECT COUNT(*) as count FROM votes WHERE game_id = ?'
    ).get(gameId) as { count: number };

    return playerCount.count === voteCount.count;
  }

  // Terminer la partie
  endGame(gameId: number, pointsMap: Map<number, number>): void {
    db.prepare(`
      UPDATE games
      SET status = 'finished', current_phase = 'reveal', finished_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(gameId);

    // Mettre à jour les points des joueurs
    const updatePoints = db.prepare(`
      UPDATE game_players SET points_earned = ? WHERE game_id = ? AND user_id = ?
    `);
    const updateUserStats = db.prepare(`
      UPDATE users SET
        games_played = games_played + 1,
        total_points = total_points + ?
      WHERE id = ?
    `);

    for (const [userId, points] of pointsMap) {
      updatePoints.run(points, gameId, userId);
      updateUserStats.run(points, userId);
    }
  }

  // Quitter une partie
  leaveGame(gameId: number, userId: number): void {
    db.prepare(
      'DELETE FROM game_players WHERE game_id = ? AND user_id = ?'
    ).run(gameId, userId);

    // Vérifier s'il reste des joueurs
    const remaining = db.prepare(
      'SELECT COUNT(*) as count FROM game_players WHERE game_id = ?'
    ).get(gameId) as { count: number };

    if (remaining.count === 0) {
      // Supprimer la partie si vide
      db.prepare('DELETE FROM games WHERE id = ?').run(gameId);
    }
  }

  // Sauvegarder un message
  saveMessage(gameId: number, userId: number, content: string): Message {
    const result = db.prepare(
      'INSERT INTO messages (game_id, user_id, content) VALUES (?, ?, ?)'
    ).run(gameId, userId, content);

    return db.prepare(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid) as Message;
  }

  // Obtenir les messages d'une partie
  getMessages(gameId: number): Message[] {
    return db.prepare(`
      SELECT m.*, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.game_id = ?
      ORDER BY m.created_at ASC
    `).all(gameId) as Message[];
  }
}

export const gameService = new GameService();
