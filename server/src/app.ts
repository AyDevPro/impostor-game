import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import gameRoutes from './routes/game.js';
import { config } from './config/env.js';

const app = express();

// Middlewares - CORS configuration
const allowedOrigins = config.nodeEnv === 'production'
  ? [config.corsOrigin]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/games', gameRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export default app;
