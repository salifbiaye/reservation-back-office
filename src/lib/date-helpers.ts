/**
 * Obtenir le début et la fin d'aujourd'hui
 */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin de cette semaine (lundi-dimanche)
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Lundi = début de semaine

  const start = new Date(now)
  start.setDate(now.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin de ce mois
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin du mois dernier
 */
export function getLastMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Obtenir le début et la fin de la semaine dernière
 */
export function getLastWeekRange(): { start: Date; end: Date } {
  const thisWeek = getThisWeekRange()
  const start = new Date(thisWeek.start)
  start.setDate(start.getDate() - 7)

  const end = new Date(thisWeek.end)
  end.setDate(end.getDate() - 7)

  return { start, end }
}

/**
 * Calculer le pourcentage de variation entre deux valeurs
 */
export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
