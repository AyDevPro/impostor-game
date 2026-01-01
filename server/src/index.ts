import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/env.js';
import { initDatabase } from './config/db.js';
import { setupSocket } from './socket/index.js';

// Initialiser la base de données
initDatabase();

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
