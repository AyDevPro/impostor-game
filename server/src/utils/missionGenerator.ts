export interface DroideMission {
  id: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MISSIONS: DroideMission[] = [
  // Missions faciles
  { id: 'miss_1', description: 'Achète des Bottes en premier objet', difficulty: 'easy' },
  { id: 'miss_2', description: 'Ne farm PAS la jungle pendant 5 minutes', difficulty: 'easy' },
  { id: 'miss_3', description: 'Spam ping "En route" 3 fois de suite', difficulty: 'easy' },
  { id: 'miss_4', description: 'Écris "gg" dans le chat toutes les 3 minutes', difficulty: 'easy' },
  { id: 'miss_5', description: 'Achète une Potion de Contrôle (Pink Ward)', difficulty: 'easy' },

  // Missions moyennes
  { id: 'miss_6', description: 'Vole un objectif neutre (Drake/Baron/Herald)', difficulty: 'medium' },
  { id: 'miss_7', description: 'Meurs exactement 3 fois (pas plus, pas moins)', difficulty: 'medium' },
  { id: 'miss_8', description: 'Termine avec exactement 100 CS (+/- 5)', difficulty: 'medium' },
  { id: 'miss_9', description: 'Ne retourne PAS à la base avant 10 minutes', difficulty: 'medium' },
  { id: 'miss_10', description: 'Obtiens un double kill', difficulty: 'medium' },

  // Missions difficiles
  { id: 'miss_11', description: 'Fais un pentakill OU vole le Baron', difficulty: 'hard' },
  { id: 'miss_12', description: 'Termine avec le MOINS de dégâts de ton équipe', difficulty: 'hard' },
  { id: 'miss_13', description: 'Place 15 wards pendant la partie', difficulty: 'hard' },
  { id: 'miss_14', description: 'Gagne sans acheter de Mythique', difficulty: 'hard' },
  { id: 'miss_15', description: 'Fais 5 kills sans mourir (killing spree)', difficulty: 'hard' }
];

export function generateRandomMission(): DroideMission {
  const randomIndex = Math.floor(Math.random() * MISSIONS.length);
  return MISSIONS[randomIndex];
}

export function generateMissions(count: number): DroideMission[] {
  // Mélanger et prendre les N premières
  const shuffled = [...MISSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, MISSIONS.length));
}
