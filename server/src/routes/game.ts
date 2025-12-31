import { Router, Request, Response } from 'express';
import { gameService } from '../services/gameService.js';
import { playerService } from '../services/playerService.js';

const router = Router();

// POST /api/games - Créer une partie
router.post('/', (req: Request, res: Response) => {
  try {
    const { username, sessionId } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Pseudo requis' });
    }

    // Créer ou récupérer le joueur
    const player = playerService.getOrCreatePlayer(username.trim(), sessionId);

    const game = gameService.createGame(player.id);
    res.status(201).json({ game, sessionId: player.session_id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/games/join - Rejoindre une partie
router.post('/join', (req: Request, res: Response) => {
  try {
    const { code, username, sessionId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code de partie requis' });
    }

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Pseudo requis' });
    }

    // Créer ou récupérer le joueur
    const player = playerService.getOrCreatePlayer(username.trim(), sessionId);

    const game = gameService.joinGame(code.toUpperCase(), player.id);
    res.json({ game, sessionId: player.session_id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/games/:code - Obtenir les détails d'une partie
router.get('/:code', (req: Request, res: Response) => {
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

export default router;
