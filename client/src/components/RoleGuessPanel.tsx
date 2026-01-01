import { useState } from 'react';
import { GamePlayer, RoleId } from '../types';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent } from './ui/Card';
import { ROLES } from '../utils/constants';

interface RoleGuessPanelProps {
  players: GamePlayer[];
  myPlayerId: number;
  onSubmit: (guesses: { targetId: number; guessedRole: RoleId }[]) => void;
  hasSubmitted: boolean;
}

export function RoleGuessPanel({ players, myPlayerId, onSubmit, hasSubmitted }: RoleGuessPanelProps) {
  // Map: playerId -> guessedRole
  const [guesses, setGuesses] = useState<Map<number, RoleId>>(new Map());

  // Filtrer le joueur actuel
  const otherPlayers = players.filter(p => p.player_id !== myPlayerId);

  // Tous les rôles disponibles
  const allRoles = Object.keys(ROLES) as RoleId[];

  const handleGuess = (playerId: number, roleId: RoleId) => {
    const newGuesses = new Map(guesses);
    newGuesses.set(playerId, roleId);
    setGuesses(newGuesses);
  };

  const handleSubmit = () => {
    // Vérifier que tous les joueurs ont été devinés
    if (guesses.size !== otherPlayers.length) {
      alert('Tu dois deviner le rôle de tous les joueurs !');
      return;
    }

    // Convertir en tableau
    const guessArray = otherPlayers.map(p => ({
      targetId: p.player_id,
      guessedRole: guesses.get(p.player_id)!
    }));

    onSubmit(guessArray);
  };

  const allGuessed = guesses.size === otherPlayers.length;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-white text-center">
          Devine les rôles !
        </h2>
        <p className="text-gray-400 text-center mt-2">
          Attribue un rôle à chaque joueur. Plus tu es précis, plus tu gagnes de points !
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {otherPlayers.map(player => {
            const selectedRole = guesses.get(player.player_id);

            return (
              <div
                key={player.player_id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                {/* Nom du joueur */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {player.username}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {selectedRole ? (
                      <span className="text-primary-400">
                        Rôle deviné : {ROLES[selectedRole].name}
                      </span>
                    ) : (
                      'Sélectionne un rôle...'
                    )}
                  </p>
                </div>

                {/* Grille de sélection des rôles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {allRoles.map(roleId => {
                    const role = ROLES[roleId];
                    const isSelected = selectedRole === roleId;

                    return (
                      <button
                        key={roleId}
                        onClick={() => handleGuess(player.player_id, roleId)}
                        disabled={hasSubmitted}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${isSelected
                            ? 'ring-2 ring-offset-2 ring-offset-gray-800'
                            : 'opacity-70 hover:opacity-100'
                          }
                          ${hasSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        style={{
                          backgroundColor: isSelected ? role.color : role.color + '40',
                          color: isSelected ? '#fff' : role.color,
                          borderColor: role.color,
                          borderWidth: '2px'
                        }}
                      >
                        {role.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé et bouton de soumission */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Progression : {guesses.size} / {otherPlayers.length} joueurs
            </div>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!allGuessed || hasSubmitted}
              className="text-lg"
            >
              {hasSubmitted ? '✓ Devinettes envoyées' : 'Valider mes devinettes'}
            </Button>
          </div>

          {!allGuessed && (
            <p className="text-yellow-400 text-sm mt-3 text-center">
              ⚠️ Tu dois deviner le rôle de tous les joueurs avant de valider
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
