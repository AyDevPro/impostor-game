import { Request } from 'express';

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  created_at: string;
  games_played: number;
  games_won: number;
  total_points: number;
}

export interface AuthRequest extends Request {
  userId?: number;
  user?: User;
}

// Game types
export type GameStatus = 'lobby' | 'playing' | 'voting' | 'finished';
export type GamePhase = 'debate' | 'vote' | 'reveal' | null;

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
  user_id: number;
  role: string | null;
  is_ready: number;
  points_earned: number;
  username?: string;
}

// Role types
export type RoleId = 'imposteur' | 'droide' | 'serpentin' | 'double_face' | 'super_heros';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  objective: string;
  color: string;
  points: number;
}

// Vote types
export interface Vote {
  id: number;
  game_id: number;
  voter_id: number;
  target_id: number;
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

// Socket types
export interface ServerToClientEvents {
  'lobby:player-joined': (player: GamePlayer & { username: string }) => void;
  'lobby:player-left': (data: { playerId: number }) => void;
  'lobby:player-ready': (data: { playerId: number; isReady: boolean }) => void;
  'lobby:updated': (players: (GamePlayer & { username: string })[]) => void;
  'chat:new-message': (message: Message) => void;
  'game:started': (data: { role: Role; phaseEndTime: string }) => void;
  'game:phase-change': (data: { phase: GamePhase; endTime?: string }) => void;
  'vote:received': (data: { voterId: number }) => void;
  'vote:results': (data: { votes: VoteResult[]; points: PlayerPoints[] }) => void;
  'game:ended': (results: GameResult) => void;
  'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'lobby:join': (data: { gameCode: string }) => void;
  'lobby:leave': (data: { gameCode: string }) => void;
  'lobby:ready': (data: { gameCode: string }) => void;
  'lobby:unready': (data: { gameCode: string }) => void;
  'chat:message': (data: { gameCode: string; content: string }) => void;
  'game:start': (data: { gameCode: string }) => void;
  'vote:cast': (data: { gameCode: string; targetId: number }) => void;
}

export interface VoteResult {
  oderId: number;
  targetId: number;
  voterUsername: string;
  targetUsername: string;
}

export interface PlayerPoints {
  userId: number;
  username: string;
  role: string;
  points: number;
}

export interface GameResult {
  players: (GamePlayer & { username: string; role: string })[];
  votes: VoteResult[];
  points: PlayerPoints[];
  impostorId: number;
  impostorCaught: boolean;
}
