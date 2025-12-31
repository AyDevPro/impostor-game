import { db } from '../config/db.js';
import { randomBytes } from 'crypto';

export interface Player {
  id: number;
  username: string;
  session_id: string;
  created_at: string;
}

export class PlayerService {
  // Créer ou récupérer un joueur par session_id
  getOrCreatePlayer(username: string, sessionId?: string): Player {
    // Si sessionId fourni, chercher le joueur existant
    if (sessionId) {
      const existing = db.prepare(
        'SELECT * FROM players WHERE session_id = ?'
      ).get(sessionId) as Player | undefined;

      if (existing) {
        // Mettre à jour le pseudo si différent
        if (existing.username !== username) {
          db.prepare(
            'UPDATE players SET username = ? WHERE id = ?'
          ).run(username, existing.id);
          existing.username = username;
        }
        return existing;
      }
    }

    // Créer un nouveau joueur avec un nouveau session_id
    const newSessionId = sessionId || this.generateSessionId();
    const result = db.prepare(
      'INSERT INTO players (username, session_id) VALUES (?, ?)'
    ).run(username, newSessionId);

    return db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid) as Player;
  }

  // Obtenir un joueur par ID
  getPlayerById(playerId: number): Player | null {
    return db.prepare('SELECT * FROM players WHERE id = ?').get(playerId) as Player || null;
  }

  // Obtenir un joueur par session_id
  getPlayerBySessionId(sessionId: string): Player | null {
    return db.prepare('SELECT * FROM players WHERE session_id = ?').get(sessionId) as Player || null;
  }

  // Générer un session_id unique
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  // Nettoyer les joueurs inactifs (optionnel, pour éviter l'accumulation)
  cleanupInactivePlayers(olderThanHours: number = 24): void {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
    db.prepare('DELETE FROM players WHERE created_at < ? AND id NOT IN (SELECT DISTINCT player_id FROM game_players)').run(cutoffDate);
  }
}

export const playerService = new PlayerService();
