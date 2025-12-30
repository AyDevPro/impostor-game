import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../hooks/useGame';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { PlayerList } from '../components/PlayerList';
import { Chat } from '../components/Chat';

export function Lobby() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    game,
    players,
    messages,
    isLoading,
    error,
    toggleReady,
    sendMessage,
    startGame,
    leaveGame
  } = useGame(code);

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
            <h2 className="text-xl font-bold text-white mb-2">Oups !</h2>
            <p className="text-gray-400 mb-4">{error || 'Partie introuvable'}</p>
            <Button onClick={() => navigate('/')}>Retour a l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rediriger vers la page de jeu si la partie a commencé
  if (game.status !== 'lobby') {
    navigate(`/game/${code}`);
    return null;
  }

  const isHost = game.host_id === user?.id;
  const myPlayer = players.find(p => p.user_id === user?.id);
  const allReady = players.length >= 5 && players.every(p => p.is_ready);
  const canStart = isHost && allReady;

  const handleLeave = () => {
    leaveGame();
    navigate('/');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code || '');
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-500">Among Legends</h1>
          <p className="text-gray-400">Lobby</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleLeave}>
          Quitter
        </Button>
      </header>

      <main className="max-w-6xl mx-auto mt-8 grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Code et joueurs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Code de la partie */}
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-gray-400 mb-2">Code de la partie</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl font-bold text-white tracking-widest">
                  {code}
                </span>
                <Button variant="secondary" size="sm" onClick={copyCode}>
                  Copier
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Partage ce code avec tes amis pour qu'ils rejoignent
              </p>
            </CardContent>
          </Card>

          {/* Liste des joueurs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Joueurs ({players.length}/10)
                </h2>
                {players.length < 5 && (
                  <span className="text-sm text-yellow-500">
                    Minimum 5 joueurs requis
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PlayerList
                players={players}
                showReady={true}
                hostId={game.host_id}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant={myPlayer?.is_ready ? 'danger' : 'success'}
              size="lg"
              className="flex-1"
              onClick={toggleReady}
            >
              {myPlayer?.is_ready ? 'Pas pret' : 'Pret !'}
            </Button>

            {isHost && (
              <Button
                size="lg"
                className="flex-1"
                disabled={!canStart}
                onClick={startGame}
              >
                {canStart ? 'Lancer la partie' : `En attente (${players.filter(p => p.is_ready).length}/${players.length} prets)`}
              </Button>
            )}
          </div>
        </div>

        {/* Colonne droite - Chat */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Chat du lobby</h2>
          </CardHeader>
          <div className="flex-1 overflow-hidden">
            <Chat messages={messages} onSend={sendMessage} />
          </div>
        </Card>
      </main>
    </div>
  );
}
