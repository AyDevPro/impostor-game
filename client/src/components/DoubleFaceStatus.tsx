import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';

interface DoubleFaceStatusProps {
  initialAlignment: 'gentil' | 'mechant';
  gameStartTime: number; // timestamp du début de la partie
}

const FLIP_INTERVAL_MS = 7 * 60 * 1000; // 7 minutes

export function DoubleFaceStatus({ initialAlignment, gameStartTime }: DoubleFaceStatusProps) {
  const [alignment, setAlignment] = useState<'gentil' | 'mechant'>(initialAlignment);
  const [timeUntilFlip, setTimeUntilFlip] = useState<number>(0);
  const [flipCount, setFlipCount] = useState<number>(0);

  useEffect(() => {
    const calculateState = () => {
      const elapsed = Date.now() - gameStartTime;
      const flips = Math.floor(elapsed / FLIP_INTERVAL_MS);
      const timeInCurrentState = elapsed % FLIP_INTERVAL_MS;
      const remaining = FLIP_INTERVAL_MS - timeInCurrentState;

      // L'alignement alterne à chaque flip
      const currentAlignment = flips % 2 === 0 ? initialAlignment : (initialAlignment === 'gentil' ? 'mechant' : 'gentil');

      setAlignment(currentAlignment);
      setFlipCount(flips);
      setTimeUntilFlip(remaining);
    };

    // Calculer immédiatement
    calculateState();

    // Mettre à jour chaque seconde
    const interval = setInterval(calculateState, 1000);

    return () => clearInterval(interval);
  }, [initialAlignment, gameStartTime]);

  const minutes = Math.floor(timeUntilFlip / 60000);
  const seconds = Math.floor((timeUntilFlip % 60000) / 1000);

  const isGentil = alignment === 'gentil';
  const nextAlignment = isGentil ? 'MECHANT' : 'GENTIL';

  return (
    <Card className={`border-2 ${isGentil ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
      <CardContent className="py-4">
        {/* État actuel */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">
            {isGentil ? '😇' : '😈'}
          </div>
          <h3 className={`text-2xl font-bold ${isGentil ? 'text-green-400' : 'text-red-400'}`}>
            {isGentil ? 'GENTIL' : 'MÉCHANT'}
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {isGentil
              ? 'Tu dois GAGNER la partie LoL !'
              : 'Tu dois PERDRE la partie LoL !'}
          </p>
        </div>

        {/* Timer jusqu'au prochain changement */}
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">
            Prochain changement dans
          </div>
          <div className={`text-2xl font-mono font-bold ${timeUntilFlip < 60000 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tu deviendras {nextAlignment}
          </div>
        </div>

        {/* Compteur de flips */}
        <div className="text-center mt-3 text-xs text-gray-500">
          Changements effectués : {flipCount}
        </div>
      </CardContent>
    </Card>
  );
}
