import { Role, RoleId } from '../types';

export const ROLES: Record<RoleId, Role> = {
  imposteur: {
    id: 'imposteur',
    name: 'Imposteur',
    description: 'Tu dois faire perdre la game sans te faire demasquer. +2 si defaite, -3 si victoire, +1 par joueur qui ne te vote pas.',
    objective: 'Faire perdre ton equipe ET ne pas etre vote comme imposteur',
    color: '#FF4444',
    points: 0
  },
  droide: {
    id: 'droide',
    name: 'Droide',
    description: 'Tu recois des missions pendant la partie. +2 victoire, -2 defaite, +1 si toutes les missions completees.',
    objective: 'Gagner la game ET suivre toutes tes instructions',
    color: '#44AAFF',
    points: 0
  },
  serpentin: {
    id: 'serpentin',
    name: 'Serpentin',
    description: 'Gameplay agressif ! +2 victoire, -2 defaite, +1 si plus de degats, +1 si plus de morts.',
    objective: 'Gagner la game ET etre premier en degats ET en morts',
    color: '#44FF44',
    points: 0
  },
  double_face: {
    id: 'double_face',
    name: 'Double-Face',
    description: 'Ton alignement change toutes les 7 min. +2 si gentil a la victoire OU mechant a la defaite.',
    objective: 'Etre gentil au moment de la victoire OU mechant au moment de la defaite',
    color: '#FFAA44',
    points: 0
  },
  super_heros: {
    id: 'super_heros',
    name: 'Super-Heros',
    description: 'Domination totale ! +2 victoire, -3 defaite, +1 par stat ou tu es premier (degats/kills/assists). Pas de malus si decouvert.',
    objective: 'Gagner ET etre premier en kills, assists ET degats (tous les 3)',
    color: '#AA44FF',
    points: 0
  },
  romeo: {
    id: 'romeo',
    name: 'Romeo',
    description: 'Tu es lie a une Juliette. Si elle meurt, tu as 1 minute pour te suicider. +2 victoire, -2 defaite, +1 si role respecte.',
    objective: 'Gagner la game ET respecter la regle de mort si Juliette meurt',
    color: '#FF69B4',
    points: 0
  },
  escroc: {
    id: 'escroc',
    name: 'Escroc',
    description: 'Mission extreme ! +2 victoire, -3 defaite, +1 par personne qui te vote comme imposteur.',
    objective: 'Gagner la game ET te faire voter comme imposteur',
    color: '#FFD700',
    points: 0
  }
};
