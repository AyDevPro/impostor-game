import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface DoubleFaceRevealProps {
  debateStartTime: string;
  onReveal: () => void;
}

export function DoubleFaceReveal({ debateStartTime, onReveal }: DoubleFaceRevealProps) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(debateStartTime).getTime();
      const remaining = Math.max(0, 30 - Math.floor(elapsed / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [debateStartTime]);

  const handleReveal = () => {
    setHasRevealed(true);
    onReveal();
  };

  if (timeRemaining === 0) {
    return (
      <Card className="bg-red-900/20 border-red-500">
        <CardHeader>
          <h3 className="text-red-500 font-bold">⏰ Délai écoulé</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Tu ne peux plus te révéler. Le délai de 30 secondes est passé.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (hasRevealed) {
    return (
      <Card className="bg-green-900/20 border-green-500">
        <CardHeader>
          <h3 className="text-green-500 font-bold">✅ Révélation envoyée</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Tous les joueurs ont été informés de ton identité de Double-Face.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-yellow-900/20 border-yellow-500">
      <CardHeader>
        <h3 className="text-yellow-500 font-bold">
          🎭 Pouvoir Double-Face
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {timeRemaining}s
          </div>
          <p className="text-sm text-gray-300">
            Tu as {timeRemaining} secondes pour te révéler aux autres joueurs
          </p>
        </div>

        <Button
          onClick={handleReveal}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
        >
          🎭 Me révéler maintenant
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Si tu te révèles, tous les joueurs sauront que tu es Double-Face.
          Cela peut t'aider à gagner leur confiance !
        </p>
      </CardContent>
    </Card>
  );
}
