import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { DroideMission } from '../types';

interface DroideMissionsProps {
  missions: DroideMission[];
  onCompleteMission: (missionId: string) => void;
  gameCode?: string;
}

// Fonction pour annoncer vocalement une mission
const speakMission = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn('La synthèse vocale n\'est pas supportée par ce navigateur');
    return;
  }

  // Annuler toute annonce en cours
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Chercher une voix française
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(voice =>
    voice.lang.startsWith('fr') || voice.name.toLowerCase().includes('french')
  );

  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  utterance.lang = 'fr-FR';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

export function DroideMissions({ missions, onCompleteMission, gameCode }: DroideMissionsProps) {
  // Charger l'état depuis localStorage
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => {
    if (gameCode) {
      const stored = localStorage.getItem(`droideMissions_${gameCode}`);
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });

  // Tracker les missions déjà annoncées
  const [announcedMissions] = useState<Set<string>>(() => {
    if (gameCode) {
      const stored = localStorage.getItem(`droideMissions_announced_${gameCode}`);
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  });

  // Charger les voix au démarrage (nécessaire pour certains navigateurs)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Annoncer les nouvelles missions
  useEffect(() => {
    if (missions.length === 0) return;

    const newMissions = missions.filter(m => !announcedMissions.has(m.id));

    if (newMissions.length > 0) {
      // Annoncer chaque nouvelle mission
      newMissions.forEach((mission, index) => {
        // Délai pour éviter que les annonces se chevauchent
        setTimeout(() => {
          const announcement = `Nouvelle mission droïde : ${mission.description}`;
          speakMission(announcement);
          console.log(`[DROIDE] Annonce vocale: ${announcement}`);
        }, index * 500);

        // Marquer comme annoncée
        announcedMissions.add(mission.id);
      });

      // Sauvegarder les missions annoncées dans localStorage
      if (gameCode) {
        localStorage.setItem(
          `droideMissions_announced_${gameCode}`,
          JSON.stringify([...announcedMissions])
        );
      }
    }
  }, [missions, gameCode, announcedMissions]);

  // Sauvegarder dans localStorage quand l'état change
  useEffect(() => {
    if (gameCode && completedMissions.size > 0) {
      localStorage.setItem(`droideMissions_${gameCode}`, JSON.stringify([...completedMissions]));
    }
  }, [completedMissions, gameCode]);

  const handleComplete = (missionId: string) => {
    setCompletedMissions(prev => new Set([...prev, missionId]));
    onCompleteMission(missionId);
  };

  return (
    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-blue-400 font-bold text-sm">Missions</span>
        <span className="text-blue-300 text-xs">
          {completedMissions.size}/{missions.length} complétées
        </span>
      </div>

      <div className="space-y-2">
        {missions.map((mission) => {
          const isCompleted = completedMissions.has(mission.id);

          return (
            <div
              key={mission.id}
              className={`flex items-center gap-2 p-2 rounded ${
                isCompleted
                  ? 'bg-green-900/30 border border-green-600'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              <p className={`text-sm flex-1 ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                {mission.description}
              </p>

              {isCompleted ? (
                <span className="text-green-400 text-sm">✓</span>
              ) : (
                <Button
                  onClick={() => handleComplete(mission.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-0.5 h-6 min-w-0"
                >
                  OK
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
