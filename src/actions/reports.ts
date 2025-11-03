"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getThisMonthRange, getLastMonthRange } from "@/lib/date-helpers"

/**
 * Générer un rapport mensuel (ADMIN uniquement)
 */
export async function generateMonthlyReport(month?: Date) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  const range = month ? getMonthRange(month) : getThisMonthRange()

  // Récupérer toutes les réservations du mois
  const reservations = await db.reservation.findMany({
    where: {
      createdAt: {
        gte: range.start,
        lte: range.end
      }
    },
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
          commission: {
            select: {
              name: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Statistiques globales
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === "PENDING").length,
    accepted: reservations.filter(r => r.status === "ACCEPTED").length,
    rejected: reservations.filter(r => r.status === "REJECTED").length,
  }

  // Grouper par commission
  const byCommission: Record<string, any> = {}
  reservations.forEach(res => {
    const commissionName = res.location.commission.name
    if (!byCommission[commissionName]) {
      byCommission[commissionName] = {
        total: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
      }
    }
    byCommission[commissionName].total++
    if (res.status === "ACCEPTED") byCommission[commissionName].accepted++
    if (res.status === "REJECTED") byCommission[commissionName].rejected++
    if (res.status === "PENDING") byCommission[commissionName].pending++
  })

  // Grouper par lieu
  const byLocation: Record<string, number> = {}
  reservations.forEach(res => {
    const locationName = res.location.name
    byLocation[locationName] = (byLocation[locationName] || 0) + 1
  })

  const topLocations = Object.entries(byLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  return {
    period: {
      start: range.start,
      end: range.end,
    },
    stats,
    byCommission,
    topLocations,
    reservations: reservations.map(r => ({
      id: r.id,
      title: r.title,
      location: r.location.name,
      commission: r.location.commission.name,
      user: r.user.name,
      userEmail: r.user.email,
      start: r.start,
      end: r.end,
      status: r.status,
      createdAt: r.createdAt,
    }))
  }
}

/**
 * Générer un rapport pour une commission (CEE ou ADMIN)
 */
export async function generateCommissionReport(commissionId: string, month?: Date) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  // Vérifier les permissions
  if (session.user.role === "CEE") {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { commissionId: true }
    })

    if (user?.commissionId !== commissionId) {
      return { error: "Non autorisé pour cette commission" }
    }
  } else if (session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  const range = month ? getMonthRange(month) : getThisMonthRange()

  // Récupérer la commission
  const commission = await db.commission.findUnique({
    where: { id: commissionId },
    include: {
      locations: {
        include: {
          reservations: {
            where: {
              createdAt: {
                gte: range.start,
                lte: range.end
              }
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          }
        }
      },
      members: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })

  if (!commission) {
    return { error: "Commission introuvable" }
  }

  // Agréger les réservations de tous les lieux
  const allReservations = commission.locations.flatMap(loc =>
    loc.reservations.map(res => ({
      ...res,
      locationName: loc.name,
    }))
  )

  const stats = {
    total: allReservations.length,
    pending: allReservations.filter(r => r.status === "PENDING").length,
    accepted: allReservations.filter(r => r.status === "ACCEPTED").length,
    rejected: allReservations.filter(r => r.status === "REJECTED").length,
  }

  // Stats par lieu
  const byLocation = commission.locations.map(loc => ({
    name: loc.name,
    count: loc.reservations.length,
    maxDurationHours: loc.maxDurationHours,
  })).sort((a, b) => b.count - a.count)

  // Stats par membre CEE (qui a validé quoi)
  const byMember: Record<string, any> = {}
  allReservations.forEach(res => {
    if (res.validatedBy) {
      if (!byMember[res.validatedBy]) {
        const member = commission.members.find(m => m.id === res.validatedBy)
        byMember[res.validatedBy] = {
          name: member?.name || "Inconnu",
          accepted: 0,
          rejected: 0,
        }
      }
      if (res.status === "ACCEPTED") byMember[res.validatedBy].accepted++
      if (res.status === "REJECTED") byMember[res.validatedBy].rejected++
    }
  })

  return {
    commission: {
      id: commission.id,
      name: commission.name,
      color: commission.color,
    },
    period: {
      start: range.start,
      end: range.end,
    },
    stats,
    byLocation,
    byMember: Object.values(byMember),
    reservations: allReservations.map(r => ({
      id: r.id,
      title: r.title,
      location: r.locationName,
      user: r.user.name,
      userEmail: r.user.email,
      start: r.start,
      end: r.end,
      status: r.status,
      createdAt: r.createdAt,
    }))
  }
}

/**
 * Helper pour obtenir le range d'un mois spécifique
 */
function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}
