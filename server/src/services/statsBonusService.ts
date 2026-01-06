import { RoleId, PlayerStats } from '../types/index.js';

export interface RoleActionBonus {
  // Double-Face
  doubleFaceAlignment?: 'gentil' | 'mechant';
  // Droide
  droideMissionsCompleted?: number;
  droideTotalMissions?: number;
  // Roméo
  romeoRespectedRole?: boolean; // A suivi la règle de mort si Juliette meurt
}

export interface TeamStats {
  maxDamage: number;
  maxKills: number;
  maxAssists: number;
  maxDeaths: number;
}

export interface VoteData {
  // Nombre de joueurs qui ont voté pour ce joueur comme imposteur
  votedAsImpostor: number;
  // Nombre total de joueurs qui ont voté
  totalVoters: number;
}

export class StatsBonusService {
  // Calculer le bonus de stats pour un joueur basé sur son rôle
  calculateStatsBonus(
    roleId: RoleId,
    stats: PlayerStats,
    teamStats: TeamStats,
    roleActions?: RoleActionBonus,
    voteData?: VoteData
  ): number {
    const isVictory = stats.victory === 1;

    switch (roleId) {
      case 'super_heros':
        return this.calculateSuperHerosBonus(isVictory, stats, teamStats);

      case 'serpentin':
        return this.calculateSerpentinBonus(isVictory, stats, teamStats);

      case 'double_face':
        return this.calculateDoubleFaceBonus(isVictory, roleActions?.doubleFaceAlignment);

      case 'romeo':
        return this.calculateRomeoBonus(isVictory, roleActions?.romeoRespectedRole);

      case 'escroc':
        return this.calculateEscrocBonus(isVictory, voteData);

      case 'imposteur':
        return this.calculateImposteurBonus(isVictory, voteData);

      case 'droide':
        return this.calculateDroideBonus(isVictory, roleActions);

      default:
        return 0;
    }
  }

  // SuperHéros: +2 victoire, -3 défaite, +1 plus de dégâts/assists/kills, pas de pénalité si découvert
  private calculateSuperHerosBonus(isVictory: boolean, stats: PlayerStats, teamStats: TeamStats): number {
    let bonus = 0;

    // Victoire/Défaite
    if (isVictory) {
      bonus += 2;
    } else {
      bonus -= 3;
    }

    // +1 pour chaque stat où il est premier
    if (stats.damage >= teamStats.maxDamage) {
      bonus += 1;
    }
    if (stats.kills >= teamStats.maxKills) {
      bonus += 1;
    }
    if (stats.assists >= teamStats.maxAssists) {
      bonus += 1;
    }

    return bonus;
  }

  // Serpentin: +2 victoire, -2 défaite, +1 plus de dégâts, +1 plus de morts
  private calculateSerpentinBonus(isVictory: boolean, stats: PlayerStats, teamStats: TeamStats): number {
    let bonus = 0;

    // Victoire/Défaite
    if (isVictory) {
      bonus += 2;
    } else {
      bonus -= 2;
    }

    // +1 si plus de dégâts
    if (stats.damage >= teamStats.maxDamage) {
      bonus += 1;
    }

    // +1 si plus de morts
    if (stats.deaths >= teamStats.maxDeaths) {
      bonus += 1;
    }

    return bonus;
  }

  // Double-Face: +2 si bon timing (gentil à la victoire OU méchant à la défaite)
  private calculateDoubleFaceBonus(isVictory: boolean, alignment?: 'gentil' | 'mechant'): number {
    if (!alignment) return 0;

    // Gentil à la victoire = +2
    // Méchant à la défaite = +2
    if ((alignment === 'gentil' && isVictory) || (alignment === 'mechant' && !isVictory)) {
      return 2;
    }

    return 0;
  }

  // Roméo: +2 victoire, -2 défaite, +1 si rôle respecté (suicide si Juliette meurt)
  private calculateRomeoBonus(isVictory: boolean, respectedRole?: boolean): number {
    let bonus = 0;

    // Victoire/Défaite
    if (isVictory) {
      bonus += 2;
    } else {
      bonus -= 2;
    }

    // +1 si rôle respecté
    if (respectedRole) {
      bonus += 1;
    }

    return bonus;
  }

  // Escroc: +2 victoire, -3 défaite, +1 par personne qui vote pour lui comme imposteur
  private calculateEscrocBonus(isVictory: boolean, voteData?: VoteData): number {
    let bonus = 0;

    // Victoire/Défaite
    if (isVictory) {
      bonus += 2;
    } else {
      bonus -= 3;
    }

    // +1 par personne qui vote pour lui comme imposteur
    if (voteData) {
      bonus += voteData.votedAsImpostor;
    }

    return bonus;
  }

  // Imposteur: -3 victoire, +2 défaite, +1 par personne qui ne vote PAS pour lui comme imposteur
  private calculateImposteurBonus(isVictory: boolean, voteData?: VoteData): number {
    let bonus = 0;

    // Victoire = mauvais (équipe a gagné malgré lui), Défaite = bon (équipe a perdu)
    if (isVictory) {
      bonus -= 3;
    } else {
      bonus += 2;
    }

    // +1 par personne qui n'a PAS voté pour lui comme imposteur
    if (voteData) {
      const notVotedAsImpostor = voteData.totalVoters - voteData.votedAsImpostor;
      bonus += notVotedAsImpostor;
    }

    return bonus;
  }

  // Droide: +2 victoire, -2 défaite, +1 si rôle respecté (missions complétées)
  private calculateDroideBonus(isVictory: boolean, roleActions?: RoleActionBonus): number {
    let bonus = 0;

    // Victoire/Défaite
    if (isVictory) {
      bonus += 2;
    } else {
      bonus -= 2;
    }

    // +1 si toutes les missions sont complétées
    if (roleActions?.droideMissionsCompleted && roleActions?.droideTotalMissions) {
      if (roleActions.droideMissionsCompleted >= roleActions.droideTotalMissions) {
        bonus += 1;
      }
    }

    return bonus;
  }
}

export const statsBonusService = new StatsBonusService();
