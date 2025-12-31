import { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';

export interface DroideMission {
  id: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DroideMissionsProps {
  missions: DroideMission[];
  onCompleteMission: (missionId: string) => void;
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

export function DroideMissions({ missions, onCompleteMission }: DroideMissionsProps) {
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());

  const handleComplete = (missionId: string) => {
    setCompletedMissions(prev => new Set([...prev, missionId]));
    onCompleteMission(missionId);
  };

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

        <div className="mt-4 p-2 bg-blue-950/50 rounded text-center">
          <p className="text-xs text-blue-300">
            Missions complétées: {completedMissions.size}/{missions.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
