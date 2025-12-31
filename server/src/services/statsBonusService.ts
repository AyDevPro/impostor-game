import { RoleId, PlayerStats } from '../types/index.js';

export interface RoleActionBonus {
  doubleFaceRevealed?: boolean;
  droideMissionsCompleted?: number;
}

export class StatsBonusService {
  // Calculer le bonus de stats pour un joueur basé sur son rôle et ses stats LoL
  calculateStatsBonus(roleId: RoleId, stats: PlayerStats, roleActions?: RoleActionBonus): number {
    // Calculer le KDA
    const kda = stats.deaths === 0
      ? stats.kills + stats.assists
      : (stats.kills + stats.assists) / stats.deaths;

    const isVictory = stats.victory === 1;

    switch (roleId) {
      case 'imposteur':
        return this.calculateImposteurBonus(isVictory, kda, stats.damage);

      case 'droide':
        return this.calculateDroideBonus(kda, roleActions?.droideMissionsCompleted || 0);

      case 'serpentin':
        return this.calculateSerpentinBonus(isVictory, stats.kills, stats.damage);

      case 'double_face':
        return this.calculateDoubleFaceBonus(stats.kills, stats.assists, roleActions?.doubleFaceRevealed || false);

      case 'super_heros':
        return this.calculateSuperHerosBonus(isVictory, kda);

      case 'romeo':
        return this.calculateRomeoBonus(stats.assists);

      case 'escroc':
        return this.calculateEscrocBonus(stats.damage);

      default:
        return 0;
    }
  }

  // Imposteur : malus si trop bon (se fait repérer)
  private calculateImposteurBonus(isVictory: boolean, kda: number, damage: number): number {
    let bonus = 0;

    // Si victoire + stats trop bonnes = MALUS (suspect)
    if (isVictory && (kda > 3.5 || damage > 30000)) {
      bonus = -20; // Pénalité pour avoir été trop visible
    }
    // Si défaite + mauvaises stats = BONUS (bien joué le rôle)
    else if (!isVictory && kda < 2.0) {
      bonus = 30; // Récompense pour avoir bien fait perdre
    }
    // Stats moyennes = OK
    else if (!isVictory) {
      bonus = 15;
    }

    return bonus;
  }

  // Droide : KDA proche de 1.0 (équilibré, discret) + bonus missions
  private calculateDroideBonus(kda: number, missionsCompleted: number): number {
    const kdaDiff = Math.abs(kda - 1.0);

    let kdaBonus = 0;
    if (kdaDiff <= 0.2) {
      kdaBonus = 40; // Parfait, très discret
    } else if (kdaDiff <= 0.5) {
      kdaBonus = 25; // Bien
    } else if (kdaDiff <= 1.0) {
      kdaBonus = 15; // Acceptable
    } else {
      kdaBonus = 5; // Trop visible
    }

    // Bonus pour les missions complétées : 15 points par mission
    const missionBonus = missionsCompleted * 15;

    return kdaBonus + missionBonus;
  }

  // Serpentin : bonus pour kills et damage élevés
  private calculateSerpentinBonus(isVictory: boolean, kills: number, damage: number): number {
    let bonus = 0;

    // Bonus pour victoire
    if (isVictory) {
      bonus += 20;
    }

    // Bonus pour beaucoup de kills
    if (kills >= 15) {
      bonus += 30;
    } else if (kills >= 10) {
      bonus += 20;
    } else if (kills >= 7) {
      bonus += 10;
    }

    // Bonus pour beaucoup de dégâts
    if (damage >= 35000) {
      bonus += 20;
    } else if (damage >= 25000) {
      bonus += 10;
    }

    return bonus;
  }

  // Double Face : stats équilibrées et bonne participation + bonus révélation
  private calculateDoubleFaceBonus(kills: number, assists: number, revealed: boolean): number {
    const participation = kills + assists;

    let participationBonus = 0;
    if (participation >= 15) {
      participationBonus = 35; // Excellente participation
    } else if (participation >= 10) {
      participationBonus = 25; // Bonne participation
    } else if (participation >= 5) {
      participationBonus = 15; // Participation acceptable
    } else {
      participationBonus = 5; // Participation faible
    }

    // Bonus si révélé dans les 30 secondes : +25 points
    const revealBonus = revealed ? 25 : 0;

    return participationBonus + revealBonus;
  }

  // Super Héros : GROS malus si défaite, bonus si victoire + bon KDA
  private calculateSuperHerosBonus(isVictory: boolean, kda: number): number {
    if (!isVictory) {
      return -50; // GROSSE pénalité si défaite (objectif raté)
    }

    // Victoire : bonus selon performance
    if (kda >= 5.0) {
      return 50; // Performance héroïque
    } else if (kda >= 3.5) {
      return 35; // Très bonne performance
    } else if (kda >= 2.5) {
      return 20; // Bonne performance
    }
    return 10; // Performance moyenne
  }

  // Roméo : bonus pour assists (protège Juliette)
  private calculateRomeoBonus(assists: number): number {
    if (assists >= 15) {
      return 35; // Excellent support
    } else if (assists >= 10) {
      return 25; // Bon support
    } else if (assists >= 7) {
      return 15; // Support acceptable
    }
    return 5; // Support faible
  }

  // Escroc : bonus si peu de dégâts (discret)
  private calculateEscrocBonus(damage: number): number {
    if (damage < 12000) {
      return 35; // Très discret
    } else if (damage < 18000) {
      return 25; // Assez discret
    } else if (damage < 25000) {
      return 15; // Peu discret
    }
    return 5; // Trop visible
  }
}

export const statsBonusService = new StatsBonusService();
