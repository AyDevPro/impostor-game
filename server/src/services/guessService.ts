import Database from 'better-sqlite3';
import { RoleGuess, RoleId } from '../types/index.js';

export class GuessService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // Soumettre les devinettes de rôles d'un joueur
  submitGuesses(
    gameId: number,
    guesserId: number,
    guesses: { targetId: number; guessedRole: RoleId }[]
  ): void {
    // Supprimer les anciennes devinettes si elles existent
    const deleteStmt = this.db.prepare(`
      DELETE FROM role_guesses
      WHERE game_id = ? AND guesser_id = ?
    `);
    deleteStmt.run(gameId, guesserId);

    // Insérer les nouvelles devinettes
    const insertStmt = this.db.prepare(`
      INSERT INTO role_guesses (game_id, guesser_id, target_id, guessed_role)
      VALUES (?, ?, ?, ?)
    `);

    for (const guess of guesses) {
      insertStmt.run(gameId, guesserId, guess.targetId, guess.guessedRole);
    }
  }

  // Récupérer toutes les devinettes d'une partie
  getGameGuesses(gameId: number): RoleGuess[] {
    const stmt = this.db.prepare(`
      SELECT * FROM role_guesses
      WHERE game_id = ?
    `);

    return stmt.all(gameId) as RoleGuess[];
  }

  // Vérifier si tous les joueurs ont soumis leurs devinettes
  haveAllPlayersGuessed(gameId: number): boolean {
    // Nombre de joueurs dans la partie
    const playersStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM game_players
      WHERE game_id = ?
    `);
    const playersResult = playersStmt.get(gameId) as { count: number };
    const totalPlayers = playersResult.count;

    // Nombre de joueurs ayant soumis des devinettes (au moins une)
    const guessersStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT guesser_id) as count
      FROM role_guesses
      WHERE game_id = ?
    `);
    const guessersResult = guessersStmt.get(gameId) as { count: number };
    const playersWithGuesses = guessersResult.count;

    return totalPlayers === playersWithGuesses && totalPlayers > 0;
  }

  // Compter combien de joueurs ont soumis leurs devinettes
  countPlayersWithGuesses(gameId: number): { total: number; submitted: number } {
    const playersStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM game_players
      WHERE game_id = ?
    `);
    const playersResult = playersStmt.get(gameId) as { count: number };

    const guessersStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT guesser_id) as count
      FROM role_guesses
      WHERE game_id = ?
    `);
    const guessersResult = guessersStmt.get(gameId) as { count: number };

    return {
      total: playersResult.count,
      submitted: guessersResult.count
    };
  }

  // Calculer la précision des devinettes d'un joueur
  calculateGuesserAccuracy(
    gameId: number,
    guesserId: number,
    playerRoles: Map<number, string>
  ): { correct: number; total: number; accuracy: number } {
    const guesses = this.db.prepare(`
      SELECT target_id, guessed_role
      FROM role_guesses
      WHERE game_id = ? AND guesser_id = ?
    `).all(gameId, guesserId) as { target_id: number; guessed_role: string }[];

    let correct = 0;
    const total = guesses.length;

    for (const guess of guesses) {
      const actualRole = playerRoles.get(guess.target_id);
      if (actualRole === guess.guessed_role) {
        correct++;
      }
    }

    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return { correct, total, accuracy };
  }
}
