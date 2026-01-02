import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import api from '../api/axios';

export function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/games');
      navigate(`/lobby/${response.data.game.code}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la creation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/games/join', { code: gameCode.toUpperCase() });
      navigate(`/lobby/${gameCode.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Impossible de rejoindre');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 animate-fade-in">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between py-6 px-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎮</span>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Among Legends
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 hidden sm:block">
            Hey, <span className="text-white font-bold">{user?.username}</span> 👋
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto mt-8 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-6xl font-black text-white mb-6 leading-tight">
            Prêt à jouer ? 🔥
          </h2>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Rejoins tes amis pour une partie de déduction sociale épique.
            <br />
            <span className="text-primary-400 font-semibold">Trouve l'imposteur... ou deviens-en un !</span>
          </p>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="group hover:border-primary-500 hover:scale-105 transition-all cursor-pointer relative overflow-hidden" onClick={handleCreateGame}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="text-center py-10 relative z-10">
              <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="text-2xl font-black text-white mb-3">Créer une partie</h3>
              <p className="text-gray-300 mb-6 text-lg">
                Lance une nouvelle partie et invite tes amis
              </p>
              <Button size="lg" isLoading={isLoading} onClick={(e) => { e.stopPropagation(); handleCreateGame(); }} className="w-full">
                Créer maintenant
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-purple-500 hover:scale-105 transition-all cursor-pointer relative overflow-hidden" onClick={() => setShowJoinModal(true)}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="text-center py-10 relative z-10">
              <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-2xl font-black text-white mb-3">Rejoindre une partie</h3>
              <p className="text-gray-300 mb-6 text-lg">
                Entre le code pour rejoindre tes amis
              </p>
              <Button variant="outline" size="lg" onClick={(e) => { e.stopPropagation(); setShowJoinModal(true); }} className="w-full">
                Rejoindre
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats rapides */}
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📊</span> Tes statistiques
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-5xl font-black bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent mb-2">
                  {user?.games_played || 0}
                </div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Parties jouées</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                  {user?.games_won || 0}
                </div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Victoires</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  {user?.total_points || 0}
                </div>
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Points totaux</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal Rejoindre */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🎮</span> Rejoindre une partie
                </h3>
                <button
                  onClick={() => { setShowJoinModal(false); setError(''); setGameCode(''); }}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGame} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Code de la partie"
                  placeholder="ABC123"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => { setShowJoinModal(false); setError(''); setGameCode(''); }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                    disabled={gameCode.length < 6}
                  >
                    Rejoindre
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
