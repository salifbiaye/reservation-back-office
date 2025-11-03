"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
  getTodayRange,
  getThisWeekRange,
  getThisMonthRange,
  getLastMonthRange,
  calculateGrowthPercentage,
} from "@/lib/date-helpers"

/**
 * Stats globales pour ADMIN
 */
async function getAdminStats() {
  const today = getTodayRange()
  const thisWeek = getThisWeekRange()
  const thisMonth = getThisMonthRange()
  const lastMonth = getLastMonthRange()

  // Stats totales
  const [total, pending, accepted, rejected] = await Promise.all([
    db.reservation.count(),
    db.reservation.count({ where: { status: "PENDING" } }),
    db.reservation.count({ where: { status: "ACCEPTED" } }),
    db.reservation.count({ where: { status: "REJECTED" } }),
  ])

  // Stats temporelles
  const [todayCount, thisWeekCount, thisMonthCount, lastMonthCount] = await Promise.all([
    db.reservation.count({
      where: { createdAt: { gte: today.start, lte: today.end } }
    }),
    db.reservation.count({
      where: { createdAt: { gte: thisWeek.start, lte: thisWeek.end } }
    }),
    db.reservation.count({
      where: { createdAt: { gte: thisMonth.start, lte: thisMonth.end } }
    }),
    db.reservation.count({
      where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } }
    }),
  ])

  // Croissance mois vs mois dernier
  const monthGrowth = calculateGrowthPercentage(thisMonthCount, lastMonthCount)

  // Stats par lieu (top 5)
  const locationStats = await db.location.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          reservations: true
        }
      }
    },
    orderBy: {
      reservations: {
        _count: "desc"
      }
    },
    take: 5
  })

  // Stats par commission
  const commissionStats = await db.commission.findMany({
    select: {
      id: true,
      name: true,
      color: true,
      locations: {
        select: {
          _count: {
            select: {
              reservations: true
            }
          }
        }
      }
    }
  })

  const commissionsWithCounts = commissionStats.map(commission => ({
    id: commission.id,
    name: commission.name,
    color: commission.color,
    reservationsCount: commission.locations.reduce(
      (sum, loc) => sum + loc._count.reservations,
      0
    )
  }))

  return {
    overview: {
      total,
      pending,
      accepted,
      rejected,
    },
    temporal: {
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      monthGrowth,
    },
    topLocations: locationStats.map(loc => ({
      id: loc.id,
      name: loc.name,
      count: loc._count.reservations
    })),
    commissions: commissionsWithCounts,
  }
}

/**
 * Stats pour CEE (sa commission uniquement)
 */
async function getCEEStats(userId: string, commissionId: string) {
  const today = getTodayRange()
  const thisWeek = getThisWeekRange()
  const thisMonth = getThisMonthRange()

  // Where condition pour cette commission
  const commissionWhere = {
    location: {
      commissionId
    }
  }

  // Stats totales de la commission
  const [total, pending, accepted, rejected] = await Promise.all([
    db.reservation.count({ where: commissionWhere }),
    db.reservation.count({ where: { ...commissionWhere, status: "PENDING" } }),
    db.reservation.count({ where: { ...commissionWhere, status: "ACCEPTED" } }),
    db.reservation.count({ where: { ...commissionWhere, status: "REJECTED" } }),
  ])

  // Stats des validations personnelles du CEE
  const [myValidated, myRejected] = await Promise.all([
    db.reservation.count({
      where: {
        ...commissionWhere,
        status: "ACCEPTED",
        validatedBy: userId
      }
    }),
    db.reservation.count({
      where: {
        ...commissionWhere,
        status: "REJECTED",
        validatedBy: userId
      }
    }),
  ])

  // Stats temporelles
  const [todayCount, thisWeekCount, thisMonthCount] = await Promise.all([
    db.reservation.count({
      where: {
        ...commissionWhere,
        createdAt: { gte: today.start, lte: today.end }
      }
    }),
    db.reservation.count({
      where: {
        ...commissionWhere,
        createdAt: { gte: thisWeek.start, lte: thisWeek.end }
      }
    }),
    db.reservation.count({
      where: {
        ...commissionWhere,
        createdAt: { gte: thisMonth.start, lte: thisMonth.end }
      }
    }),
  ])

  // Stats par lieu de la commission
  const locationStats = await db.location.findMany({
    where: { commissionId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          reservations: true
        }
      }
    },
    orderBy: {
      reservations: {
        _count: "desc"
      }
    }
  })

  // Récupérer les infos de la commission
  const commission = await db.commission.findUnique({
    where: { id: commissionId },
    select: {
      id: true,
      name: true,
      color: true,
    }
  })

  return {
    overview: {
      total,
      pending,
      accepted,
      rejected,
    },
    myActions: {
      validated: myValidated,
      rejected: myRejected,
      total: myValidated + myRejected,
    },
    temporal: {
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
    },
    locations: locationStats.map(loc => ({
      id: loc.id,
      name: loc.name,
      count: loc._count.reservations
    })),
    commission,
  }
}

/**
 * Point d'entrée principal - Route vers ADMIN ou CEE stats
 */
export async function getDashboardStats() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  const { role, id: userId } = session.user

  if (role === "ADMIN") {
    return {
      type: "ADMIN" as const,
      data: await getAdminStats()
    }
  }

  if (role === "CEE") {
    // Récupérer la commission du CEE
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { commissionId: true }
    })

    if (!user?.commissionId) {
      return { error: "Commission non trouvée pour ce CEE" }
    }

    return {
      type: "CEE" as const,
      data: await getCEEStats(userId, user.commissionId)
    }
  }

  return { error: "Rôle non autorisé" }
}

/**
 * Récupérer les données temporelles pour les graphiques (dernier mois, jour par jour)
 */
export async function getTimeSeriesData() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 90) // 90 jours de données

  // Récupérer toutes les réservations des 90 derniers jours
  const reservations = await db.reservation.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: now
      }
    },
    select: {
      createdAt: true,
      status: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  // Grouper par date
  const dataByDate = new Map<string, { pending: number; accepted: number; rejected: number }>()

  // Initialiser toutes les dates des 90 derniers jours
  for (let i = 0; i <= 90; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dataByDate.set(dateStr, { pending: 0, accepted: 0, rejected: 0 })
  }

  // Compter les réservations par date et statut
  reservations.forEach(reservation => {
    const dateStr = reservation.createdAt.toISOString().split('T')[0]
    const data = dataByDate.get(dateStr)
    if (data) {
      if (reservation.status === 'PENDING') data.pending++
      else if (reservation.status === 'ACCEPTED') data.accepted++
      else if (reservation.status === 'REJECTED') data.rejected++
    }
  })

  // Convertir en tableau pour le graphique
  const chartData = Array.from(dataByDate.entries()).map(([date, counts]) => ({
    date,
    pending: counts.pending,
    accepted: counts.accepted,
    rejected: counts.rejected,
    total: counts.pending + counts.accepted + counts.rejected
  }))

  return chartData
}

/**
 * Récupérer l'activité récente
 */
export async function getRecentActivity() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  const userId = session.user.id
  const userRole = session.user.role

  const where = userRole === "ADMIN"
    ? {}
    : {
        location: {
          commission: {
            members: {
              some: { id: userId }
            }
          }
        }
      }

  const recentReservations = await db.reservation.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      location: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 10
  })

  return recentReservations
}
