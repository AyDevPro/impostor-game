import { Router, Response } from 'express';
import { db } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest, User } from '../types/index.js';

const router = Router();

// GET /api/leaderboard - Top 50 joueurs
router.get('/', (req, res) => {
  try {
    const leaderboard = db.prepare(`
      SELECT id, username, total_points, games_played, games_won
      FROM users
      WHERE games_played > 0
      ORDER BY total_points DESC
      LIMIT 50
    `).all();

    res.json({ leaderboard });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/leaderboard/me - Position du joueur courant
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = db.prepare(`
      SELECT id, username, total_points, games_played, games_won
      FROM users WHERE id = ?
    `).get(req.userId) as Omit<User, 'password_hash' | 'email' | 'created_at'>;

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    // Calculer le rang
    const rank = db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM users
      WHERE total_points > ?
    `).get(user.total_points) as { rank: number };

    res.json({ user, rank: rank.rank });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
