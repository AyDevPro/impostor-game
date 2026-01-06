import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../hooks/useGame';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { RoleCard } from '../components/RoleCard';
import { Chat } from '../components/Chat';
import { Timer } from '../components/ui/Timer';
import { RoleGuessPanel } from '../components/RoleGuessPanel';
import { PlayerList } from '../components/PlayerList';
import { Button } from '../components/ui/Button';
import { StatsForm } from '../components/StatsForm';
import { DoubleFaceReveal } from '../components/DoubleFaceReveal';
import { DroideMissions } from '../components/DroideMissions';
import { DoubleFaceNotification } from '../components/DoubleFaceNotification';
import { ROLES } from '../utils/constants';
import { RoleId } from '../types';

export function Game() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const {
    game,
    players,
    messages,
    myRole,
    phaseEndTime,
    gameResult,
    statsSubmitted,
    totalPlayers,
    hasSubmittedStats,
    hasSubmittedGuesses,
    isLoading,
    error,
    droideMissions,
    doubleFaceRevealed,
    debateStartTime,
    roleSpecialData,
    sendMessage,
    startStats,
    submitStats,
    submitGuesses,
    revealDoubleFace,
    completeDroideMission
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
    const impostorPlayer = players.find(p => p.player_id === gameResult?.impostorId);

    return (
      <div className="min-h-screen p-4">
        <header className="max-w-4xl mx-auto py-4">
          <h1 className="text-2xl font-bold text-primary-500 text-center">Resultats</h1>
        </header>

        <main className="max-w-4xl mx-auto mt-8 space-y-6">
          {/* Résultat principal */}
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Fin de la partie !
              </h2>
              <p className="text-gray-400">
                {impostorPlayer?.username} etait l'Imposteur
              </p>
            </CardContent>
          </Card>

          {/* Classement */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Classement final</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameResult?.points
                  .sort((a, b) => b.points - a.points)
                  .map((player, index) => {
                    const roleInfo = ROLES[player.role as RoleId];
                    const objectiveSuccess = player.breakdown && player.breakdown.statsBonus >= 0;

                    return (
                      <div
                        key={player.userId}
                        className="p-4 rounded-lg bg-gray-700/50 border border-gray-600"
                        style={{ borderLeftColor: roleInfo?.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              index === 2 ? 'text-orange-400' : 'text-gray-500'
                            }`}>
                              #{index + 1}
                            </span>
                            <div>
                              <div className="font-medium text-white flex items-center gap-2">
                                {player.username}
                                {player.breakdown && (
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    objectiveSuccess
                                      ? 'bg-green-900/50 text-green-400'
                                      : 'bg-red-900/50 text-red-400'
                                  }`}>
                                    {objectiveSuccess ? '✓ Objectif' : '✗ Échoué'}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm capitalize" style={{ color: roleInfo?.color }}>
                                {roleInfo?.name || player.role.replace('_', '-')}
                              </div>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-yellow-400">
                            {player.points} pts
                          </span>
                        </div>

                        {/* Objectif du rôle */}
                        {roleInfo && (
                          <div className="text-xs text-gray-500 mb-2 italic">
                            Objectif : {roleInfo.objective}
                          </div>
                        )}

                        {/* Breakdown des points */}
                        {player.breakdown && (
                          <div className="flex gap-4 text-sm mt-3 pt-3 border-t border-gray-600">
                            <div className="text-gray-400">
                              Base: <span className="text-white">{player.breakdown.base}</span>
                            </div>
                            <div className="text-gray-400">
                              Devinettes: <span className="text-green-400">+{player.breakdown.guessBonus}</span>
                            </div>
                            <div className="text-gray-400">
                              Stats: <span className={player.breakdown.statsBonus >= 0 ? 'text-blue-400' : 'text-red-400'}>
                                {player.breakdown.statsBonus >= 0 ? '+' : ''}{player.breakdown.statsBonus}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Stats LoL */}
          {gameResult?.playerStats && gameResult.playerStats.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Statistiques League of Legends</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameResult.playerStats.map(stat => {
                    const player = players.find(p => p.player_id === stat.player_id);
                    const kda = stat.deaths === 0
                      ? stat.kills + stat.assists
                      : ((stat.kills + stat.assists) / stat.deaths).toFixed(2);

                    return (
                      <div
                        key={stat.player_id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">{player?.username}</div>
                            <div className="text-xs text-gray-400 capitalize">
                              {player?.role?.replace('_', '-')}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded text-sm font-semibold ${
                            stat.victory ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                          }`}>
                            {stat.victory ? 'Victoire' : 'Défaite'}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400 text-xs">KDA</div>
                            <div className="text-white font-bold">
                              {stat.kills}/{stat.deaths}/{stat.assists}
                            </div>
                            <div className="text-gray-500 text-xs">{kda} ratio</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Dégâts</div>
                            <div className="text-white font-semibold">
                              {(stat.damage / 1000).toFixed(1)}k
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">CS</div>
                            <div className="text-white font-semibold">{stat.cs}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résultats des devinettes */}
          {gameResult?.guessResults && gameResult.guessResults.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Devinettes de rôles</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameResult.guessResults.map(result => (
                    <div key={result.guesserId} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{result.guesserUsername}</h4>
                        <div className="text-sm">
                          <span className="text-gray-400">Précision: </span>
                          <span className={`font-bold ${
                            result.accuracy >= 80 ? 'text-green-400' :
                            result.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {result.accuracy.toFixed(0)}%
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({result.correctGuesses}/{result.totalGuesses})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {result.guesses.map(guess => (
                          <div
                            key={guess.targetId}
                            className={`text-sm p-2 rounded ${
                              guess.isCorrect
                                ? 'bg-green-900/30 border border-green-700'
                                : 'bg-red-900/30 border border-red-700'
                            }`}
                          >
                            <div className="font-medium text-white">{guess.targetUsername}</div>
                            <div className="text-xs text-gray-400">
                              Deviné: <span className="capitalize">{guess.guessedRole.replace('_', '-')}</span>
                              {!guess.isCorrect && (
                                <span> → <span className="capitalize">{guess.actualRole.replace('_', '-')}</span></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/')}>
              Retour a l'accueil
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Phase de vote - Deviner les rôles
  if (game.current_phase === 'vote') {
    // Trouver le player_id du joueur actuel via le username
    const currentUsername = localStorage.getItem('username');
    const currentPlayer = players.find(p => p.username === currentUsername);
    const myPlayerId = currentPlayer?.player_id || 0;

    return (
      <div className="min-h-screen p-4">
        <header className="max-w-4xl mx-auto py-4">
          <h1 className="text-2xl font-bold text-primary-500 text-center">Phase de Vote</h1>
          {phaseEndTime && <Timer endTime={phaseEndTime} />}
        </header>

        <main className="max-w-4xl mx-auto mt-8">
          <RoleGuessPanel
            players={players}
            myPlayerId={myPlayerId}
            onSubmit={submitGuesses}
            hasSubmitted={hasSubmittedGuesses}
          />
        </main>
      </div>
    );
  }

  // Phase de stats - Formulaire
  if (game.status === 'playing' && game.current_phase === 'stats' && !hasSubmittedStats) {
    return (
      <div className="min-h-screen p-4">
        <header className="max-w-4xl mx-auto py-4">
          <h1 className="text-3xl font-bold text-primary-500 text-center">Soumettre mes stats</h1>
        </header>

        <main className="max-w-2xl mx-auto mt-8">
          <StatsForm
            onSubmit={(stats) => {
              submitStats(stats);
            }}
            disabled={hasSubmittedStats}
          />
        </main>
      </div>
    );
  }

  // Phase de stats - Attente des autres joueurs
  if (game.status === 'playing' && game.current_phase === 'stats' && hasSubmittedStats) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Stats soumises !
            </h1>
            <p className="text-gray-400 mb-8">
              En attente des autres joueurs...
            </p>

            {/* Barre de progression */}
            <div className="bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-primary-500 h-full transition-all duration-500"
                style={{ width: `${totalPlayers > 0 ? (statsSubmitted / totalPlayers) * 100 : 0}%` }}
              />
            </div>

            <p className="text-xl font-semibold text-white mb-2">
              {statsSubmitted} / {totalPlayers} joueurs
            </p>
            <p className="text-sm text-gray-500">
              Le débat commencera quand tout le monde aura soumis ses stats
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Déterminer si le joueur actuel est l'hôte (pour la phase de rôle)
  const currentUsernameForRole = localStorage.getItem('username');
  const currentPlayerForRole = players.find(p => p.username === currentUsernameForRole);
  const isHostForRole = game?.host_id === currentPlayerForRole?.player_id;

  // Phase de jeu (League of Legends en cours) - Les joueurs voient leur rôle
  if (game.status === 'playing' && game.current_phase === null) {
    return (
      <div className="min-h-screen p-4">
        <header className="max-w-4xl mx-auto py-4">
          <h1 className="text-3xl font-bold text-primary-500 text-center">Partie en cours</h1>
        </header>

        <main className="max-w-3xl mx-auto mt-8 space-y-6">
          {/* Rappel du rôle - toujours visible */}
          {myRole && (
            <div style={{ borderColor: myRole.color }} className="border-2 rounded-xl">
              <Card>
                <CardContent className="py-8">
                  {/* Nom du rôle */}
                  <div className="text-center mb-6">
                    <div
                      className="inline-block text-4xl font-bold px-8 py-4 rounded-lg"
                      style={{
                        backgroundColor: myRole.color + '20',
                        color: myRole.color,
                        border: `2px solid ${myRole.color}`
                      }}
                    >
                      {myRole.name}
                    </div>
                  </div>

                  {/* Description et objectif */}
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-primary-400 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {myRole.description}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                        Objectif
                      </h3>
                      <p className="text-white font-medium leading-relaxed">
                        {myRole.objective}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                      <p className="text-yellow-400 font-semibold text-center">
                        Points maximum : {myRole.points} pts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Missions Droide - Seulement pour le rôle Droide */}
          {myRole?.id === 'droide' && droideMissions.length > 0 && (
            <DroideMissions
              missions={droideMissions}
              onCompleteMission={completeDroideMission}
            />
          )}

          {/* Alignement Double-Face */}
          {myRole?.id === 'double_face' && roleSpecialData?.alignment && (
            <Card className={`border-2 ${roleSpecialData.alignment === 'gentil' ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
              <CardContent className="py-6 text-center">
                <div className="text-4xl mb-3">
                  {roleSpecialData.alignment === 'gentil' ? '😇' : '😈'}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${roleSpecialData.alignment === 'gentil' ? 'text-green-400' : 'text-red-400'}`}>
                  Tu es {roleSpecialData.alignment === 'gentil' ? 'GENTIL' : 'MÉCHANT'}
                </h3>
                <p className="text-gray-300">
                  {roleSpecialData.alignment === 'gentil'
                    ? 'Tu gagnes si ton équipe GAGNE la partie LoL !'
                    : 'Tu gagnes si ton équipe PERD la partie LoL !'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Juliette pour Roméo */}
          {myRole?.id === 'romeo' && roleSpecialData?.julietteName && (
            <Card className="border-2 border-pink-500 bg-pink-900/20">
              <CardContent className="py-6 text-center">
                <div className="text-4xl mb-3">💕</div>
                <h3 className="text-2xl font-bold mb-2 text-pink-400">
                  Ta Juliette est : {roleSpecialData.julietteName}
                </h3>
                <p className="text-gray-300">
                  Si elle meurt en jeu, tu as 1 minute pour te suicider !
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  (Elle peut être dans ton équipe ou l'équipe adverse)
                </p>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Lance ta partie de League of Legends !
              </h2>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                Joue ta partie normalement tout en respectant les objectifs de ton rôle.
                Quand la partie est terminée, reviens ici pour soumettre tes statistiques.
              </p>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 max-w-xl mx-auto">
                <p className="text-yellow-400 font-medium">
                  ⚠️ N'oublie pas ton rôle et tes objectifs pendant la partie !
                </p>
              </div>

              {/* Bouton pour passer à la phase stats - Seulement pour l'hôte */}
              {isHostForRole ? (
                <Button
                  size="lg"
                  className="text-xl py-4 px-8"
                  onClick={startStats}
                >
                  🏁 Fin de la partie LoL - Passer aux stats
                </Button>
              ) : (
                <div className="text-gray-400 text-center">
                  <p>En attente que l'hôte termine la partie LoL...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Liste des joueurs */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white text-center">
                Joueurs dans la partie ({players.length})
              </h3>
            </CardHeader>
            <CardContent>
              <PlayerList players={players} />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Phase de débat
  // Trouver le joueur actuel pour savoir s'il est l'hôte
  const currentUsername = localStorage.getItem('username');
  const currentPlayer = players.find(p => p.username === currentUsername);
  const isHost = game?.host_id === currentPlayer?.player_id;

  const handleSkipDebate = () => {
    if (socket && code) {
      socket.emit('debate:host-skip', { gameCode: code });
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Notification Double-Face */}
      {doubleFaceRevealed && (
        <DoubleFaceNotification username={doubleFaceRevealed.username} />
      )}

      <header className="max-w-6xl mx-auto py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary-500">Phase de Debat</h1>
          <div className="flex items-center gap-4">
            {phaseEndTime && <Timer endTime={phaseEndTime} />}
            {isHost && (
              <Button
                onClick={handleSkipDebate}
                variant="secondary"
                size="sm"
              >
                Passer au vote
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Rôle et joueurs */}
        <div className="space-y-6">
          {/* Mon rôle */}
          {myRole && <RoleCard role={myRole} />}

          {/* Timer Double-Face - Seulement pour le rôle Double-Face */}
          {myRole?.id === 'double_face' && debateStartTime && (
            <DoubleFaceReveal
              debateStartTime={debateStartTime}
              onReveal={revealDoubleFace}
            />
          )}

          {/* Alignement Double-Face (rappel) */}
          {myRole?.id === 'double_face' && roleSpecialData?.alignment && (
            <Card className={`border ${roleSpecialData.alignment === 'gentil' ? 'border-green-500' : 'border-red-500'}`}>
              <CardContent className="py-3 text-center">
                <span className={`font-bold ${roleSpecialData.alignment === 'gentil' ? 'text-green-400' : 'text-red-400'}`}>
                  {roleSpecialData.alignment === 'gentil' ? '😇 GENTIL' : '😈 MÉCHANT'}
                </span>
              </CardContent>
            </Card>
          )}

          {/* Juliette pour Roméo (rappel) */}
          {myRole?.id === 'romeo' && roleSpecialData?.julietteName && (
            <Card className="border border-pink-500">
              <CardContent className="py-3 text-center">
                <span className="text-pink-400 font-bold">
                  💕 Juliette : {roleSpecialData.julietteName}
                </span>
              </CardContent>
            </Card>
          )}

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
