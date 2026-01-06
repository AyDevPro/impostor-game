import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface DroideMission {
  id: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Chemin vers le fichier des missions
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MISSIONS_FILE = join(__dirname, '../../data/missions.json');

// Charger les missions depuis le fichier JSON
function loadMissions(): DroideMission[] {
  try {
    const data = readFileSync(MISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.missions || [];
  } catch (error) {
    console.error('Erreur lors du chargement des missions:', error);
    // Missions de fallback si le fichier ne peut pas être lu
    return [
      { id: 'fallback_1', description: 'Gagne la partie', difficulty: 'easy' },
      { id: 'fallback_2', description: 'Fais au moins 5 kills', difficulty: 'medium' },
      { id: 'fallback_3', description: 'Ne meurs pas plus de 3 fois', difficulty: 'hard' }
    ];
  }
}

export function generateRandomMission(): DroideMission {
  const missions = loadMissions();
  const randomIndex = Math.floor(Math.random() * missions.length);
  return missions[randomIndex];
}

export function generateMissions(count: number): DroideMission[] {
  const missions = loadMissions();

  // Séparer par difficulté pour un meilleur équilibre
  const easy = missions.filter(m => m.difficulty === 'easy');
  const medium = missions.filter(m => m.difficulty === 'medium');
  const hard = missions.filter(m => m.difficulty === 'hard');

  // Mélanger chaque catégorie
  const shuffleArray = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const shuffledEasy = shuffleArray(easy);
  const shuffledMedium = shuffleArray(medium);
  const shuffledHard = shuffleArray(hard);

  // Prendre 1 facile, 1 moyenne, 1 difficile (si count >= 3)
  const result: DroideMission[] = [];

  if (count >= 1 && shuffledEasy.length > 0) {
    result.push(shuffledEasy[0]);
  }
  if (count >= 2 && shuffledMedium.length > 0) {
    result.push(shuffledMedium[0]);
  }
  if (count >= 3 && shuffledHard.length > 0) {
    result.push(shuffledHard[0]);
  }

  // Si on veut plus de missions, ajouter aléatoirement
  const allShuffled = shuffleArray(missions);
  for (const mission of allShuffled) {
    if (result.length >= count) break;
    if (!result.find(m => m.id === mission.id)) {
      result.push(mission);
    }
  }

  return result;
}
