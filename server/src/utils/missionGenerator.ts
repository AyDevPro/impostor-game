import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface DroideMission {
  id: string;
  description: string;
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
      { id: 'fallback_1', description: 'Gagne la partie' },
      { id: 'fallback_2', description: 'Fais au moins 5 kills' },
      { id: 'fallback_3', description: 'Ne meurs pas plus de 3 fois' }
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

  // Mélanger toutes les missions
  const shuffleArray = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  const shuffledMissions = shuffleArray(missions);

  // Prendre le nombre demandé de missions (sans doublons)
  return shuffledMissions.slice(0, Math.min(count, shuffledMissions.length));
}
