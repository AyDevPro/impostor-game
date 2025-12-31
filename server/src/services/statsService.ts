import Database from 'better-sqlite3';
import { PlayerStats } from '../types/index.js';

export class StatsService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // Soumettre les stats d'un joueur
  submitStats(
    gameId: number,
    playerId: number,
    stats: {
      victory: boolean;
      kills: number;
      deaths: number;
      assists: number;
      damage: number;
      cs: number;
    }
  ): PlayerStats {
    const stmt = this.db.prepare(`
      INSERT INTO player_stats (game_id, player_id, victory, kills, deaths, assists, damage, cs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(game_id, player_id) DO UPDATE SET
        victory = excluded.victory,
        kills = excluded.kills,
        deaths = excluded.deaths,
        assists = excluded.assists,
        damage = excluded.damage,
        cs = excluded.cs
    `);

    stmt.run(
      gameId,
      playerId,
      stats.victory ? 1 : 0,
      stats.kills,
      stats.deaths,
      stats.assists,
      stats.damage,
      stats.cs
    );

    // Récupérer les stats insérées
    const getStmt = this.db.prepare(`
      SELECT * FROM player_stats
      WHERE game_id = ? AND player_id = ?
    `);

    return getStmt.get(gameId, playerId) as PlayerStats;
  }

  // Récupérer toutes les stats d'une partie
  getGameStats(gameId: number): PlayerStats[] {
    const stmt = this.db.prepare(`
      SELECT * FROM player_stats
      WHERE game_id = ?
    `);

    return stmt.all(gameId) as PlayerStats[];
  }

  // Vérifier si tous les joueurs ont soumis leurs stats
  allStatsSubmitted(gameId: number): boolean {
    // Nombre de joueurs dans la partie
    const playersStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM game_players
      WHERE game_id = ?
    `);
    const playersResult = playersStmt.get(gameId) as { count: number };
    const totalPlayers = playersResult.count;

    // Nombre de stats soumises
    const statsStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM player_stats
      WHERE game_id = ?
    `);
    const statsResult = statsStmt.get(gameId) as { count: number };
    const submittedStats = statsResult.count;

    return totalPlayers === submittedStats && totalPlayers > 0;
  }

  // Compter combien de joueurs ont soumis leurs stats
  countSubmittedStats(gameId: number): { total: number; submitted: number } {
    const playersStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM game_players
      WHERE game_id = ?
    `);
    const playersResult = playersStmt.get(gameId) as { count: number };

    const statsStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM player_stats
      WHERE game_id = ?
    `);
    const statsResult = statsStmt.get(gameId) as { count: number };

    return {
      total: playersResult.count,
      submitted: statsResult.count
    };
  }
}
