import { GamePlayer } from '../types';

interface PlayerListProps {
  players: GamePlayer[];
  showReady?: boolean;
  showRole?: boolean;
  onVote?: (playerId: number) => void;
  votedFor?: number;
  hostId?: number;
  myPlayerId?: number;
}

const roleColors: Record<string, string> = {
  imposteur: 'bg-red-500',
  droide: 'bg-blue-500',
  serpentin: 'bg-green-500',
  double_face: 'bg-orange-500',
  super_heros: 'bg-purple-500'
};

export function PlayerList({
  players,
  showReady = false,
  showRole = false,
  onVote,
  votedFor,
  hostId,
  myPlayerId
}: PlayerListProps) {

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.player_id}
          className={`flex items-center justify-between p-3 rounded-lg bg-gray-700/50 ${
            onVote && player.player_id !== myPlayerId ? 'cursor-pointer hover:bg-gray-700' : ''
          } ${votedFor === player.player_id ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => {
            if (onVote && player.player_id !== myPlayerId) {
              onVote(player.player_id);
            }
          }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar placeholder */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              showRole && player.role ? roleColors[player.role] || 'bg-gray-600' : 'bg-gray-600'
            }`}>
              {player.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{player.username}</span>
                {player.player_id === hostId && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                    Hote
                  </span>
                )}
                {player.player_id === myPlayerId && (
                  <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded">
                    Toi
                  </span>
                )}
              </div>
              {showRole && player.role && (
                <span className="text-sm text-gray-400 capitalize">
                  {player.role.replace('_', '-')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showReady && (
              <span className={`text-sm font-medium ${
                player.is_ready ? 'text-green-400' : 'text-gray-500'
              }`}>
                {player.is_ready ? 'Pret' : 'Pas pret'}
              </span>
            )}

            {showRole && player.points_earned !== undefined && (
              <span className="text-sm font-bold text-yellow-400">
                +{player.points_earned} pts
              </span>
            )}

            {onVote && player.player_id !== myPlayerId && (
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  votedFor === player.player_id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(player.player_id);
                }}
              >
                {votedFor === player.player_id ? 'Vote !' : 'Voter'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
