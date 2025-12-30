import { Router, Response } from 'express';
import { gameService } from '../services/gameService.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// POST /api/games - Créer une partie
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const game = gameService.createGame(req.userId!);
    res.status(201).json({ game });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/games/join - Rejoindre une partie
router.post('/join', (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code de partie requis' });
    }

    const game = gameService.joinGame(code.toUpperCase(), req.userId!);
    res.json({ game });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/games/:code - Obtenir les détails d'une partie
router.get('/:code', (req: AuthRequest, res: Response) => {
  try {
    const game = gameService.getGameByCode(req.params.code.toUpperCase());

    if (!game) {
      return res.status(404).json({ error: 'Partie introuvable' });
    }

    const players = gameService.getGamePlayers(game.id);
    const messages = gameService.getMessages(game.id);

    res.json({ game, players, messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/games/:code/ready - Toggle ready status
router.post('/:code/ready', (req: AuthRequest, res: Response) => {
  try {
    const game = gameService.getGameByCode(req.params.code.toUpperCase());

    if (!game) {
      return res.status(404).json({ error: 'Partie introuvable' });
    }

    const isReady = gameService.toggleReady(game.id, req.userId!);
    res.json({ isReady });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/games/:code/vote - Voter pour un joueur
router.post('/:code/vote', (req: AuthRequest, res: Response) => {
  try {
    const { targetId } = req.body;
    const game = gameService.getGameByCode(req.params.code.toUpperCase());

    if (!game) {
      return res.status(404).json({ error: 'Partie introuvable' });
    }

    if (game.current_phase !== 'vote') {
      return res.status(400).json({ error: 'La phase de vote n\'est pas active' });
    }

    gameService.castVote(game.id, req.userId!, targetId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
