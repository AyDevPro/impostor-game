import Database from 'better-sqlite3';
import { db } from '../config/db.js';

export type RoleActionType = 'double_face_reveal' | 'droide_mission_completed';

export interface RoleAction {
  id: number;
  game_id: number;
  player_id: number;
  action_type: RoleActionType;
  action_data: string | null;
  created_at: string;
}

export class RoleActionsService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // Enregistrer une action spéciale
  recordAction(
    gameId: number,
    playerId: number,
    actionType: RoleActionType,
    actionData?: any
  ): RoleAction {
    const stmt = this.db.prepare(`
      INSERT INTO role_actions (game_id, player_id, action_type, action_data)
      VALUES (?, ?, ?, ?)
    `);

    const dataJson = actionData ? JSON.stringify(actionData) : null;
    stmt.run(gameId, playerId, actionType, dataJson);

    const getStmt = this.db.prepare(`
      SELECT * FROM role_actions
      WHERE game_id = ? AND player_id = ? AND action_type = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    return getStmt.get(gameId, playerId, actionType) as RoleAction;
  }

  // Vérifier si Double-Face s'est révélé
  hasDoubleFaceRevealed(gameId: number, playerId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM role_actions
      WHERE game_id = ? AND player_id = ? AND action_type = 'double_face_reveal'
    `);

    const result = stmt.get(gameId, playerId) as { count: number };
    return result.count > 0;
  }

  // Compter les missions Droide complétées
  countDroideMissionsCompleted(gameId: number, playerId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM role_actions
      WHERE game_id = ? AND player_id = ? AND action_type = 'droide_mission_completed'
    `);

    const result = stmt.get(gameId, playerId) as { count: number };
    return result.count;
  }

  // Récupérer toutes les actions d'une partie
  getGameActions(gameId: number): RoleAction[] {
    const stmt = this.db.prepare(`
      SELECT * FROM role_actions
      WHERE game_id = ?
      ORDER BY created_at ASC
    `);

    return stmt.all(gameId) as RoleAction[];
  }

  // Récupérer les actions d'un joueur
  getPlayerActions(gameId: number, playerId: number): RoleAction[] {
    const stmt = this.db.prepare(`
      SELECT * FROM role_actions
      WHERE game_id = ? AND player_id = ?
      ORDER BY created_at ASC
    `);

    return stmt.all(gameId, playerId) as RoleAction[];
  }
}

export const roleActionsService = new RoleActionsService(db);
