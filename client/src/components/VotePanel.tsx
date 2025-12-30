import { useState } from 'react';
import { GamePlayer } from '../types';
import { PlayerList } from './PlayerList';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Timer } from './ui/Timer';

interface VotePanelProps {
  players: GamePlayer[];
  onVote: (playerId: number) => void;
  phaseEndTime: string;
  hasVoted: boolean;
}

export function VotePanel({ players, onVote, phaseEndTime, hasVoted }: VotePanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleVote = () => {
    if (selectedPlayer && !hasVoted) {
      onVote(selectedPlayer);
      setConfirmed(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Phase de Vote</h2>
          <Timer endTime={phaseEndTime} />
        </div>
      </CardHeader>

      <CardContent>
        {hasVoted || confirmed ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              &#9989;
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">
              Vote enregistre !
            </h3>
            <p className="text-gray-400">
              En attente des autres joueurs...
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-4 text-center">
              Qui est l'Imposteur ? Votez pour le demasquer !
            </p>

            <PlayerList
              players={players}
              onVote={setSelectedPlayer}
              votedFor={selectedPlayer || undefined}
            />

            <div className="mt-6 flex justify-center">
              <Button
                variant="danger"
                size="lg"
                onClick={handleVote}
                disabled={!selectedPlayer}
              >
                Confirmer mon vote
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
