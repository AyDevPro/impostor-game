import { RoleId, Role, PlayerStats } from '../types/index.js';
import { ROLES } from '../utils/constants.js';
import { statsBonusService, RoleActionBonus, TeamStats, VoteData } from './statsBonusService.js';

export interface GuessData {
  guesserId: number;
  targetId: number;
  guessedRole: RoleId;
  actualRole: RoleId;
  isCorrect: boolean;
}

export interface PointsBreakdown {
  total: number;
  voteBonus: number;      // +1/-1 par vote correct/incorrect
  discoveryBonus: number; // +1 par joueur qui ne devine pas ton rôle, -1 par joueur qui le devine
  roleBonus: number;      // Bonus spécifique au rôle
}

export class RoleService {
  // Mélange aléatoire d'un tableau (Fisher-Yates)
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Attribuer les rôles aux joueurs
  assignRoles(playerIds: number[]): Map<number, RoleId> {
    const roleIds = Object.keys(ROLES) as RoleId[];
    const shuffledRoles = this.shuffle(roleIds);
    const assignments = new Map<number, RoleId>();

    // Garantir au moins 1 imposteur
    const shuffledPlayers = this.shuffle(playerIds);
    assignments.set(shuffledPlayers[0], 'imposteur');

    // Attribuer les autres rôles
    for (let i = 1; i < shuffledPlayers.length; i++) {
      // On prend les rôles non-imposteur et on les distribue
      const availableRoles = shuffledRoles.filter(r => r !== 'imposteur');
      const roleIndex = (i - 1) % availableRoles.length;
      assignments.set(shuffledPlayers[i], availableRoles[roleIndex]);
    }

    return assignments;
  }

  // Obtenir les infos d'un rôle
  getRole(roleId: RoleId): Role {
    return ROLES[roleId];
  }

  // Calculer les stats max de l'équipe pour les comparaisons
  calculateTeamStats(playerStats: Map<number, PlayerStats>): TeamStats {
    let maxDamage = 0;
    let maxKills = 0;
    let maxAssists = 0;
    let maxDeaths = 0;

    for (const stats of playerStats.values()) {
      if (stats.damage > maxDamage) maxDamage = stats.damage;
      if (stats.kills > maxKills) maxKills = stats.kills;
      if (stats.assists > maxAssists) maxAssists = stats.assists;
      if (stats.deaths > maxDeaths) maxDeaths = stats.deaths;
    }

    return { maxDamage, maxKills, maxAssists, maxDeaths };
  }

  // Calculer les données de vote pour chaque joueur (qui a été voté comme imposteur)
  calculateVoteData(
    players: { userId: number; role: RoleId }[],
    guesses: GuessData[]
  ): Map<number, VoteData> {
    const voteData = new Map<number, VoteData>();
    const totalVoters = new Set(guesses.map(g => g.guesserId)).size;

    // Initialiser pour chaque joueur
    for (const player of players) {
      voteData.set(player.userId, { votedAsImpostor: 0, totalVoters });
    }

    // Compter les votes "imposteur" pour chaque cible
    for (const guess of guesses) {
      if (guess.guessedRole === 'imposteur') {
        const current = voteData.get(guess.targetId);
        if (current) {
          current.votedAsImpostor++;
        }
      }
    }

    return voteData;
  }

  // Calculer les points pour chaque joueur avec le nouveau système
  calculatePoints(
    players: { userId: number; role: RoleId }[],
    guesses: GuessData[],
    playerStats: Map<number, PlayerStats>,
    roleActions?: Map<number, RoleActionBonus>
  ): Map<number, PointsBreakdown> {
    const points = new Map<number, PointsBreakdown>();
    const teamStats = this.calculateTeamStats(playerStats);
    const voteData = this.calculateVoteData(players, guesses);

    for (const player of players) {
      // 1. Bonus de vote: +1 par vote correct, -1 par vote incorrect
      const playerGuesses = guesses.filter(g => g.guesserId === player.userId);
      let voteBonus = 0;
      for (const guess of playerGuesses) {
        if (guess.isCorrect) {
          voteBonus += 1;
        } else {
          voteBonus -= 1;
        }
      }

      // 2. Bonus de découverte: +1 par joueur qui ne devine pas ton rôle, -1 par joueur qui le devine
      // Exception: SuperHéros n'a pas de pénalité si découvert
      const guessesAboutMe = guesses.filter(g => g.targetId === player.userId);
      let discoveryBonus = 0;

      if (player.role === 'super_heros') {
        // SuperHéros: seulement +1 pour chaque joueur qui ne devine pas son rôle
        for (const guess of guessesAboutMe) {
          if (!guess.isCorrect) {
            discoveryBonus += 1;
          }
          // Pas de -1 si découvert
        }
      } else {
        // Autres rôles: +1 si pas découvert, -1 si découvert
        for (const guess of guessesAboutMe) {
          if (guess.isCorrect) {
            discoveryBonus -= 1;
          } else {
            discoveryBonus += 1;
          }
        }
      }

      // 3. Bonus spécifique au rôle
      let roleBonus = 0;
      const stats = playerStats.get(player.userId);
      if (stats) {
        const actions = roleActions?.get(player.userId);
        const playerVoteData = voteData.get(player.userId);
        roleBonus = statsBonusService.calculateStatsBonus(
          player.role,
          stats,
          teamStats,
          actions,
          playerVoteData
        );
      }

      // Total
      const total = voteBonus + discoveryBonus + roleBonus;

      points.set(player.userId, {
        total,
        voteBonus,
        discoveryBonus,
        roleBonus
      });
    }

    return points;
  }
}

export const roleService = new RoleService();
