import { Role, RoleId } from '../types';

export const ROLES: Record<RoleId, Role> = {
  imposteur: {
    id: 'imposteur',
    name: 'Imposteur',
    description: 'Tu dois faire perdre la game sans te faire demasquer.',
    objective: 'Faire perdre ton equipe ET ne pas etre vote comme imposteur',
    color: '#FF4444',
    points: 100
  },
  droide: {
    id: 'droide',
    name: 'Droide',
    description: 'Tu recois des instructions toutes les 5 minutes. Suis-les tout en gagnant la partie.',
    objective: 'Gagner la game ET suivre toutes tes instructions',
    color: '#44AAFF',
    points: 80
  },
  serpentin: {
    id: 'serpentin',
    name: 'Serpentin',
    description: 'Gameplay ultra agressif ! Tu dois avoir le PLUS de kills ET le PLUS de degats de ton equipe.',
    objective: 'Gagner la game ET etre premier en kills ET en degats de ton equipe',
    color: '#44FF44',
    points: 90
  },
  double_face: {
    id: 'double_face',
    name: 'Double-Face',
    description: 'Ton alignement change aleatoirement entre 4 et 15 min. Tu gagnes si tu es gentil a la victoire OU mechant a la defaite.',
    objective: 'Etre gentil au moment de la victoire OU mechant au moment de la defaite',
    color: '#FFAA44',
    points: 120
  },
  super_heros: {
    id: 'super_heros',
    name: 'Super-Heros',
    description: 'Domination totale ! Tu dois avoir le PLUS de kills, assists ET degats. GROSSE penalite si tu perds.',
    objective: 'Gagner ET etre premier en kills, assists ET degats (tous les 3)',
    color: '#AA44FF',
    points: 150
  },
  romeo: {
    id: 'romeo',
    name: 'Romeo',
    description: 'Tu es lie a une Juliette aleatoire (alliee ou ennemie). Si elle meurt, tu as 1 minute pour te suicider.',
    objective: 'Gagner la game ET respecter la regle de mort si Juliette meurt',
    color: '#FF69B4',
    points: 75
  },
  escroc: {
    id: 'escroc',
    name: 'Escroc',
    description: 'Mission extreme : Gagner la game ET te faire voter comme imposteur. Si tu reussis, les autres perdent leurs points de victoire !',
    objective: 'Gagner la game ET obtenir la majorite des votes "Imposteur"',
    color: '#FFD700',
    points: 100
  }
};
