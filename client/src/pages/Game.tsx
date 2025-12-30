import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { RoleCard } from '../components/RoleCard';
import { Chat } from '../components/Chat';
import { Timer } from '../components/ui/Timer';
import { VotePanel } from '../components/VotePanel';
import { PlayerList } from '../components/PlayerList';
import { Button } from '../components/ui/Button';

export function Game() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    game,
    players,
    messages,
    myRole,
    phaseEndTime,
    gameResult,
    isLoading,
    error,
    sendMessage,
    castVote
  } = useGame(code);

  const [hasVoted, setHasVoted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <div className="text-5xl mb-4">&#128533;</div>
            <h2 className="text-xl font-bold text-white mb-2">Erreur</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phase de résultats
  if (game.status === 'finished' || gameResult) {
    return (
      <div className="min-h-screen p-4">
        <header className="max-w-4xl mx-auto py-4">
          <h1 className="text-2xl font-bold text-primary-500 text-center">Resultats</h1>
        </header>

        <main className="max-w-4xl mx-auto mt-8 space-y-6">
          {/* Résultat principal */}
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">
                {gameResult?.impostorCaught ? '&#127881;' : '&#128520;'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {gameResult?.impostorCaught
                  ? 'L\'Imposteur a ete demasque !'
                  : 'L\'Imposteur a gagne !'}
              </h2>
              <p className="text-gray-400">
                {players.find(p => p.role === 'imposteur')?.username} etait l'Imposteur
              </p>
            </CardContent>
          </Card>

          {/* Classement */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Classement de la partie</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gameResult?.points
                  .sort((a, b) => b.points - a.points)
                  .map((player, index) => (
                    <div
                      key={player.userId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-orange-400' : 'text-gray-500'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-white">{player.username}</div>
                          <div className="text-sm text-gray-400 capitalize">
                            {player.role.replace('_', '-')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-yellow-400">
                        +{player.points} pts
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/')}>
              Retour a l'accueil
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Phase de vote
  if (game.current_phase === 'vote') {
    return (
      <div className="min-h-screen p-4">
        <header className="max-w-4xl mx-auto py-4">
          <h1 className="text-2xl font-bold text-primary-500 text-center">Phase de Vote</h1>
        </header>

        <main className="max-w-4xl mx-auto mt-8">
          <VotePanel
            players={players}
            onVote={(targetId) => {
              castVote(targetId);
              setHasVoted(true);
            }}
            phaseEndTime={phaseEndTime || ''}
            hasVoted={hasVoted}
          />
        </main>
      </div>
    );
  }

  // Phase de débat
  return (
    <div className="min-h-screen p-4">
      <header className="max-w-6xl mx-auto py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-500">Phase de Debat</h1>
          {phaseEndTime && <Timer endTime={phaseEndTime} />}
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Rôle et joueurs */}
        <div className="space-y-6">
          {/* Mon rôle */}
          {myRole && <RoleCard role={myRole} />}

          {/* Liste des joueurs */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Joueurs</h3>
            </CardHeader>
            <CardContent>
              <PlayerList players={players} />
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Debat</h2>
                <span className="text-sm text-gray-400">
                  Discutez et trouvez l'Imposteur !
                </span>
              </div>
            </CardHeader>
            <div className="flex-1 overflow-hidden">
              <Chat messages={messages} onSend={sendMessage} />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
