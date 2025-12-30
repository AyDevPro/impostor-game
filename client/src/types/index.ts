// User types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  games_played: number;
  games_won: number;
  total_points: number;
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
  username: string;
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

// Message types
export interface Message {
  id: number;
  game_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

// Vote types
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
  players: (GamePlayer & { role: string })[];
  votes: VoteResult[];
  points: PlayerPoints[];
  impostorId: number;
  impostorCaught: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Leaderboard types
export interface LeaderboardEntry {
  id: number;
  username: string;
  total_points: number;
  games_played: number;
  games_won: number;
}
