// Gestion des badges du jeu

export const BADGES = {
  RAPIDE: {
    id: 'rapide',
    name: 'Rapide',
    description: 'Répondre rapidement aux questions',
    unlockHint: 'Répondez rapidement aux questions : temps moyen < 5 secondes sur les 10 dernières réponses',
    image: '/asset/Rapide.png',
  },
  SANS_FAUTE: {
    id: 'sans-faute',
    name: 'Sans faute',
    description: 'Victoire sans faute',
    unlockHint: 'Gagnez un quiz avec toutes les réponses correctes',
    image: '/asset/Sans-faute.png',
  },
  VICTOIRE_5: {
    id: '5-victoire',
    name: '5 victoires',
    description: 'Série de 5 victoires consécutives',
    unlockHint: 'Gagnez 5 quiz consécutifs',
    image: '/asset/5-victoire.png',
  },
};

// Récupérer les badges débloqués depuis localStorage
export function getUnlockedBadges() {
  if (typeof window === 'undefined') return [];
  try {
    const badges = localStorage.getItem('unlockedBadges');
    return badges ? JSON.parse(badges) : [];
  } catch (e) {
    console.error('Erreur lors du chargement des badges:', e);
    return [];
  }
}

// Vérifier si un badge est débloqué
export function isBadgeUnlocked(badgeId) {
  const unlocked = getUnlockedBadges();
  return unlocked.includes(badgeId);
}

// Débloquer un badge
export function unlockBadge(badgeId) {
  if (typeof window === 'undefined') return false;
  const unlocked = getUnlockedBadges();
  if (!unlocked.includes(badgeId)) {
    unlocked.push(badgeId);
    localStorage.setItem('unlockedBadges', JSON.stringify(unlocked));
    return true; // Nouveau badge débloqué
  }
  return false; // Badge déjà débloqué
}

// Obtenir le badge sélectionné pour affichage sur le profil
export function getSelectedBadge() {
  if (typeof window === 'undefined') return null;
  try {
    const selected = localStorage.getItem('selectedBadge');
    return selected || null;
  } catch (e) {
    console.error('Erreur lors du chargement du badge sélectionné:', e);
    return null;
  }
}

// Sélectionner un badge à afficher sur le profil
export function selectBadge(badgeId) {
  if (typeof window === 'undefined') return false;
  if (badgeId === null) {
    localStorage.removeItem('selectedBadge');
    return true;
  }
  if (!isBadgeUnlocked(badgeId)) return false;
  localStorage.setItem('selectedBadge', badgeId);
  return true;
}

// Désélectionner le badge affiché
export function deselectBadge() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('selectedBadge');
}

// Obtenir les statistiques de jeu depuis localStorage
export function getGameStats() {
  if (typeof window === 'undefined') {
    return {
      consecutiveWins: 0,
      totalGames: 0,
      perfectGames: 0,
      averageResponseTime: 0,
      responseTimes: [],
    };
  }
  try {
    const stats = localStorage.getItem('gameStats');
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (e) {
    console.error('Erreur lors du chargement des statistiques:', e);
  }
  return {
    consecutiveWins: 0,
    totalGames: 0,
    perfectGames: 0,
    averageResponseTime: 0,
    responseTimes: [],
  };
}

// Sauvegarder les statistiques de jeu
export function saveGameStats(stats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('gameStats', JSON.stringify(stats));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des statistiques:', e);
  }
}

// Enregistrer une partie de quiz terminée
export function recordQuizCompletion(score, total, responseTimes, isWin) {
  const stats = getGameStats();
  
  // Mettre à jour les victoires consécutives
  if (isWin) {
    stats.consecutiveWins = (stats.consecutiveWins || 0) + 1;
    
    // Vérifier le badge "5 victoires"
    if (stats.consecutiveWins >= 5) {
      unlockBadge(BADGES.VICTOIRE_5.id);
    }
  } else {
    stats.consecutiveWins = 0;
  }
  
  // Vérifier le badge "Sans faute" (score parfait ET victoire)
  if (isWin && score === total) {
    stats.perfectGames = (stats.perfectGames || 0) + 1;
    unlockBadge(BADGES.SANS_FAUTE.id);
  }
  
  // Mettre à jour les temps de réponse
  if (Array.isArray(responseTimes) && responseTimes.length > 0) {
    // Ajouter les nouveaux temps de réponse
    stats.responseTimes = (stats.responseTimes || []).concat(responseTimes);
    // Garder seulement les 100 derniers temps
    if (stats.responseTimes.length > 100) {
      stats.responseTimes = stats.responseTimes.slice(-100);
    }
    // Calculer la moyenne
    if (stats.responseTimes.length > 0) {
      stats.averageResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
    }
    
    // Vérifier le badge "Rapide" (temps moyen < 5 secondes sur les 10 dernières réponses)
    const recentTimes = stats.responseTimes.slice(-10);
    if (recentTimes.length >= 5) {
      const recentAvg = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
      if (recentAvg < 5) {
        unlockBadge(BADGES.RAPIDE.id);
      }
    }
  }
  
  stats.totalGames = (stats.totalGames || 0) + 1;
  saveGameStats(stats);
}

