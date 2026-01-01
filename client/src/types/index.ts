// User types (authenticated users)
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  games_played: number;
  games_won: number;
  total_points: number;
}

// Player types (sessions temporaires)
export interface Player {
  id: number;
  username: string;
  session_id: string;
  created_at: string;
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
  player_id: number;
  role: string | null;
  is_ready: number;
  points_earned: number;
  username: string;
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

// Message types
export interface Message {
  id: number;
  game_id: number;
  player_id: number;
  username: string;
  content: string;
  created_at: string;
}

// Role Guess types
export interface RoleGuessInput {
  targetId: number;
  guessedRole: RoleId;
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
    base: number;
    guessBonus: number;
    statsBonus: number;
  };
}

export interface GameResult {
  players: (GamePlayer & { role: string })[];
  guessResults: GuessResult[];
  points: PlayerPoints[];
  impostorId: number;
  playerStats?: Array<{
    player_id: number;
    victory: number;
    kills: number;
    deaths: number;
    assists: number;
    damage: number;
    cs: number;
  }>;
}

// Player Stats types
export interface PlayerStats {
  victory: boolean;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  cs: number;
}

// Droide Mission types
export interface DroideMission {
  id: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
