import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
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
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile'
};

const difficultyPoints = {
  easy: 10,
  medium: 20,
  hard: 35
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

  // Calculer les points bonus
  const totalPoints = missions
    .filter(m => completedMissions.has(m.id))
    .reduce((sum, m) => sum + difficultyPoints[m.difficulty], 0);

  return (
    <Card className="bg-blue-900/20 border-blue-500">
      <CardHeader>
        <h3 className="text-blue-400 font-bold">🤖 Missions Droide</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-300 mb-4">
          Complète ces missions pendant la partie LoL. Plus tu en complètes, plus tu gagnes de points !
        </p>

        {missions.map((mission) => {
          const isCompleted = completedMissions.has(mission.id);

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-lg border ${
                isCompleted
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-gray-800/50 border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        difficultyColors[mission.difficulty]
                      } text-white font-semibold`}
                    >
                      {difficultyLabels[mission.difficulty]}
                    </span>
                    <span className="text-xs text-yellow-400">
                      +{difficultyPoints[mission.difficulty]} pts
                    </span>
                    {isCompleted && (
                      <span className="text-green-400 text-sm font-bold">✓ Complétée</span>
                    )}
                  </div>
                  <p className={`text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {mission.description}
                  </p>
                </div>

                {!isCompleted && (
                  <Button
                    onClick={() => handleComplete(mission.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                  >
                    ✓
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        <div className="mt-4 p-3 bg-blue-950/50 rounded text-center space-y-1">
          <p className="text-sm text-blue-300 font-semibold">
            Missions complétées: {completedMissions.size}/{missions.length}
          </p>
          <p className="text-xs text-yellow-400">
            Bonus estimé: +{totalPoints} pts
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
