import { useState, useEffect } from 'react';

interface TimerProps {
  endTime: string;
  onComplete?: () => void;
}

export function Timer({ endTime, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLow = timeLeft <= 30;

  return (
    <div className={`text-center ${isLow ? 'text-red-500 animate-pulse-slow' : 'text-white'}`}>
      <div className="text-4xl font-bold font-mono">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="text-sm text-gray-400 mt-1">
        {isLow ? 'Temps presque ecoule !' : 'Temps restant'}
      </div>
    </div>
  );
}
