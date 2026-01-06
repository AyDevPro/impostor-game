import { useState, useEffect } from 'react';
import { Button } from './ui/Button';

export interface DroideMission {
  id: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DroideMissionsProps {
  missions: DroideMission[];
  onCompleteMission: (missionId: string) => void;
  gameCode?: string;
}

const difficultyColors = {
  easy: 'bg-green-600',
  medium: 'bg-yellow-600',
  hard: 'bg-red-600'
};

const difficultyLabels = {
  easy: 'F',
  medium: 'M',
  hard: 'D'
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
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  difficultyColors[mission.difficulty]
                } text-white font-bold`}
              >
                {difficultyLabels[mission.difficulty]}
              </span>

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
