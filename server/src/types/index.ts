import { Request } from 'express';

// User types (authenticated users)
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  games_played: number;
  total_points: number;
}

// Auth types
export interface AuthRequest extends Request {
  user?: User;
  userId?: number;
}

// Vote types (alias pour RoleGuess)
export type Vote = RoleGuess;

// Player types (sessions temporaires)
export interface Player {
  id: number;
  username: string;
  session_id: string;
  created_at: string;
}

// Game types
export type GameStatus = 'lobby' | 'playing' | 'voting' | 'finished';
export type GamePhase = 'stats' | 'debate' | 'vote' | 'reveal' | null;

export interface Game {
  id: number;
  code: string;
  host_id: number;
  status: GameStatus;
  current_phase: GamePhase;
  phase_end_time: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface GamePlayer {
  id: number;
  game_id: number;
  player_id: number;
  role: string | null;
  is_ready: number;
  points_earned: number;
  username?: string;
}

// Role types
export type RoleId = 'imposteur' | 'droide' | 'serpentin' | 'double_face' | 'super_heros' | 'romeo' | 'escroc';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  objective: string;
  color: string;
  points: number;
}

// Données spéciales envoyées avec certains rôles
export interface RoleSpecialData {
  // Double-Face : alignement
  alignment?: 'gentil' | 'mechant';
  // Roméo : id et nom de Juliette
  julietteId?: number;
  julietteName?: string;
}

// Role Guess types
export interface RoleGuess {
  id: number;
  game_id: number;
  guesser_id: number;
  target_id: number;
  guessed_role: string;
  created_at: string;
}

// Message types
export interface Message {
  id: number;
  game_id: number;
  user_id: number;
  username?: string;
  content: string;
  created_at: string;
}

// Player Stats types
export interface PlayerStats {
  id: number;
  game_id: number;
  player_id: number;
  victory: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  cs: number;
  created_at: string;
}

// Socket types
export interface ServerToClientEvents {
  'lobby:player-joined': (player: GamePlayer & { username: string }) => void;
  'lobby:player-left': (data: { playerId: number }) => void;
  'lobby:player-ready': (data: { playerId: number; isReady: boolean }) => void;
  'lobby:updated': (players: (GamePlayer & { username: string })[]) => void;
  'chat:new-message': (message: Message) => void;
  'game:started': (data: { role: Role; phaseEndTime: string }) => void;
  'game:phase-change': (data: { phase: GamePhase; endTime?: string }) => void;
  'stats:submitted': (data: { playerId: number; total: number; submitted: number }) => void;
  'stats:all-submitted': () => void;
  'guesses:received': (data: { guesserId: number }) => void;
  'game:ended': (results: GameResult) => void;
  'error': (data: { message: string }) => void;
  'session:created': (data: { sessionId: string }) => void;
  'role:double-face-revealed': (data: { playerId: number; username: string }) => void;
  'role:droide-mission': (data: { mission: string }) => void;
  'role:action-recorded': (data: { playerId: number; actionType: string }) => void;
}

export interface ClientToServerEvents {
  'lobby:join': (data: { gameCode: string }) => void;
  'lobby:leave': (data: { gameCode: string }) => void;
  'lobby:ready': (data: { gameCode: string }) => void;
  'lobby:unready': (data: { gameCode: string }) => void;
  'chat:message': (data: { gameCode: string; content: string }) => void;
  'game:start': (data: { gameCode: string }) => void;
  'stats:submit': (data: {
    gameCode: string;
    stats: {
      victory: boolean;
      kills: number;
      deaths: number;
      assists: number;
      damage: number;
      cs: number;
    }
  }) => void;
  'guesses:submit': (data: {
    gameCode: string;
    guesses: { targetId: number; guessedRole: RoleId }[]
  }) => void;
  'role:reveal-double-face': (data: { gameCode: string }) => void;
  'role:complete-droide-mission': (data: { gameCode: string; missionId: string }) => void;
}

export interface GuessResult {
  guesserId: number;
  guesserUsername: string;
  guesses: {
    targetId: number;
    targetUsername: string;
    guessedRole: string;
    actualRole: string;
    isCorrect: boolean;
  }[];
  correctGuesses: number;
  totalGuesses: number;
  accuracy: number;
}

export interface PlayerPoints {
  userId: number;
  username: string;
  role: string;
  points: number;
  breakdown?: {
    voteBonus: number;      // +1/-1 par vote correct/incorrect
    discoveryBonus: number; // +1 si non découvert, -1 si découvert
    roleBonus: number;      // Bonus spécifique au rôle
  };
}

export interface GameResult {
  players: (GamePlayer & { username: string; role: string })[];
  guessResults: GuessResult[];
  points: PlayerPoints[];
  impostorId: number;
  playerStats?: PlayerStats[];
}
