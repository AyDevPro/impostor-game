import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/env.js';
import { initDatabase } from './config/db.js';
import { setupSocket } from './socket/index.js';
import { gameService } from './services/gameService.js';

// Initialiser la base de données
initDatabase();

// Nettoyer les anciennes parties au démarrage
const cleanupResult = gameService.cleanupOldGames();
if (cleanupResult.deleted > 0) {
  console.log(`[STARTUP] Cleaned up ${cleanupResult.deleted} old games`);
}

// Nettoyage périodique toutes les heures
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 heure
setInterval(() => {
  gameService.cleanupOldGames();
}, CLEANUP_INTERVAL_MS);

// Créer le serveur HTTP
const httpServer = createServer(app);

// Configurer Socket.io avec CORS
const allowedOrigins = config.nodeEnv === 'production'
  ? [config.corsOrigin]
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup des handlers WebSocket
setupSocket(io);

// Démarrer le serveur
httpServer.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║         AMONG LEGENDS SERVER              ║
  ╠═══════════════════════════════════════════╣
  ║  Server running on port ${config.port}              ║
  ║  Environment: ${config.nodeEnv.padEnd(24)}║
  ║                                           ║
  ║  API:    http://localhost:${config.port}/api        ║
  ║  Socket: http://localhost:${config.port}            ║
  ╚═══════════════════════════════════════════╝
  `);
});
