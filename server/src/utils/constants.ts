import { Role, RoleId } from '../types/index.js';

export const ROLES: Record<RoleId, Role> = {
  imposteur: {
    id: 'imposteur',
    name: 'Imposteur',
    description: 'Tu dois faire perdre ton equipe sans te faire demasquer.',
    objective: 'Ne pas etre vote comme imposteur a la fin du debat',
    color: '#FF4444',
    points: 100
  },
  droide: {
    id: 'droide',
    name: 'Droide',
    description: 'Tu dois imiter le style de jeu d\'un autre joueur du lobby.',
    objective: 'Faire croire que tu es quelqu\'un d\'autre',
    color: '#44AAFF',
    points: 75
  },
  serpentin: {
    id: 'serpentin',
    name: 'Serpentin',
    description: 'Seme le doute ! Accuse les autres et cree la confusion.',
    objective: 'Faire accuser un innocent',
    color: '#44FF44',
    points: 75
  },
  double_face: {
    id: 'double_face',
    name: 'Double-Face',
    description: 'Change d\'avis pendant le debat. Defends puis accuse (ou inverse).',
    objective: 'Retourner ta veste de facon credible',
    color: '#FFAA44',
    points: 75
  },
  super_heros: {
    id: 'super_heros',
    name: 'Super-Heros',
    description: 'Tu dois identifier et proteger un joueur innocent.',
    objective: 'Defendre un innocent jusqu\'au bout',
    color: '#AA44FF',
    points: 75
  }
};

export const GAME_CONFIG = {
  MIN_PLAYERS: 5,
  MAX_PLAYERS: 10,
  DEBATE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  VOTE_DURATION_MS: 60 * 1000, // 1 minute
  CODE_LENGTH: 6
};
