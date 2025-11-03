"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { sendReservationAcceptedEmail, sendReservationRejectedEmail } from "@/lib/email"
import { createReservationSchema, type CreateReservationInput } from "@/schemas/reservation"
import {
  parsePaginationParams,
  getPaginationSkipTake,
  buildPaginatedResult,
  type PaginationParams,
} from "@/lib/pagination"
import {
  buildSearchCondition,
  parseSearchParam,
  parseStatusFilter,
  parseDateRangeFilter,
  buildDateRangeCondition
} from "@/lib/filters"

/**
 * Construire la condition where pour les réservations selon le rôle
 */
function buildReservationsWhere(userId: string, userRole: string, filters?: {
  search?: string | null
  status?: string | null
  dateRange?: { startDate: Date | null; endDate: Date | null }
}) {
  // Condition de base selon le rôle
  const roleWhere = userRole === "ADMIN"
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

  // Condition de recherche
  const searchWhere = filters?.search
    ? buildSearchCondition(filters.search, ["title", "description"])
    : undefined

  // Condition de statut
  const statusWhere = filters?.status ? { status: filters.status } : undefined

  // Condition de date range
  const dateRangeWhere = filters?.dateRange
    ? buildDateRangeCondition(filters.dateRange.startDate, filters.dateRange.endDate, "start")
    : undefined

  // Combiner toutes les conditions
  return {
    AND: [
      roleWhere,
      searchWhere,
      statusWhere,
      dateRangeWhere,
    ].filter(Boolean)
  }
}

export async function getReservations(params?: {
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  // Parser les paramètres de pagination et filtres
  const pagination = params?.searchParams
    ? parsePaginationParams(params.searchParams, { limit: 10 })
    : { page: 1, limit: 10 }

  const search = params?.searchParams ? parseSearchParam(params.searchParams, "search") : null
  const status = params?.searchParams ? parseStatusFilter(params.searchParams) : null
  const dateRange = params?.searchParams ? parseDateRangeFilter(params.searchParams) : { startDate: null, endDate: null }

  const where = buildReservationsWhere(session.user.id, session.user.role, { search, status, dateRange })
  const { skip, take } = getPaginationSkipTake(pagination)

  // Compter le total
  const total = await db.reservation.count({ where })

  // Récupérer les données paginées
  const reservations = await db.reservation.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      location: {
        select: {
          id: true,
          name: true,
          commission: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take,
  })

  return buildPaginatedResult(reservations, total, pagination)
}

export async function acceptReservation(reservationId: string, validatorId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { success: false, error: "Non authentifié" }
    }

    // Update reservation
    const reservation = await db.reservation.update({
      where: { id: reservationId },
      data: {
        status: "ACCEPTED",
        validatedBy: validatorId,
      },
      include: {
        user: true,
        location: true,
      }
    })

    // Send email notification
    await sendReservationAcceptedEmail(reservation.user.email, {
      studentName: reservation.user.name,
      reservationTitle: reservation.title,
      locationName: reservation.location.name,
      startDate: reservation.start,
      endDate: reservation.end,
      validatedBy: session.user.name,
    })

    revalidatePath("/reservations")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error accepting reservation:", error)
    return { success: false, error: "Erreur lors de l'acceptation" }
  }
}

export async function rejectReservation(
  reservationId: string,
  validatorId: string,
  rejectionReason: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { success: false, error: "Non authentifié" }
    }

    // Update reservation
    const reservation = await db.reservation.update({
      where: { id: reservationId },
      data: {
        status: "REJECTED",
        validatedBy: validatorId,
        rejectionReason,
      },
      include: {
        user: true,
        location: true,
      }
    })

    // Send email notification
    await sendReservationRejectedEmail(reservation.user.email, {
      studentName: reservation.user.name,
      reservationTitle: reservation.title,
      locationName: reservation.location.name,
      startDate: reservation.start,
      endDate: reservation.end,
      rejectionReason,
      validatedBy: session.user.name,
    })

    revalidatePath("/reservations")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error rejecting reservation:", error)
    return { success: false, error: "Erreur lors du refus" }
  }
}

export async function createReservation(data: CreateReservationInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { success: false, error: "Non authentifié" }
    }

    // Seuls ADMIN et CEE peuvent créer des réservations depuis le back-office
    if (!["ADMIN", "CEE"].includes(session.user.role)) {
      return { success: false, error: "Non autorisé" }
    }

    const validated = createReservationSchema.parse(data)

    // Vérifier que la location existe
    const location = await db.location.findUnique({
      where: { id: validated.locationId },
      include: {
        commission: true
      }
    })

    if (!location) {
      return { success: false, error: "Lieu introuvable" }
    }

    // Vérifier la durée maximale autorisée pour ce lieu
    if (location.maxDurationHours) {
      const durationMs = validated.end.getTime() - validated.start.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)

      if (durationHours > location.maxDurationHours) {
        return {
          success: false,
          error: `La durée de réservation ne peut pas dépasser ${location.maxDurationHours}h pour ce lieu (vous avez demandé ${Math.round(durationHours * 10) / 10}h)`
        }
      }
    }

    // Si CEE, vérifier qu'il appartient à la commission du lieu
    if (session.user.role === "CEE") {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { commissionId: true }
      })

      if (user?.commissionId !== location.commissionId) {
        return { success: false, error: "Vous ne pouvez créer des réservations que pour les lieux de votre commission" }
      }
    }

    // Vérifier les conflits de réservation
    const conflicts = await db.reservation.findMany({
      where: {
        locationId: validated.locationId,
        status: { in: ["PENDING", "ACCEPTED"] },
        OR: [
          {
            AND: [
              { start: { lte: validated.start } },
              { end: { gt: validated.start } }
            ]
          },
          {
            AND: [
              { start: { lt: validated.end } },
              { end: { gte: validated.end } }
            ]
          },
          {
            AND: [
              { start: { gte: validated.start } },
              { end: { lte: validated.end } }
            ]
          }
        ]
      }
    })

    if (conflicts.length > 0) {
      return { success: false, error: "Ce créneau est déjà réservé" }
    }

    // Créer la réservation avec statut ACCEPTED (validation automatique pour ADMIN/CEE)
    const reservation = await db.reservation.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        locationId: validated.locationId,
        userId: session.user.id,
        start: validated.start,
        end: validated.end,
        status: "ACCEPTED", // Validation automatique
        validatedBy: session.user.id,
      }
    })

    revalidatePath("/reservations")
    revalidatePath("/dashboard")

    return { success: true, reservation }
  } catch (error) {
    console.error("Error creating reservation:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function deleteReservation(reservationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { success: false, error: "Non authentifié" }
    }

    // Seuls les ADMIN peuvent supprimer des réservations
    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Seuls les administrateurs peuvent supprimer des réservations" }
    }

    // Supprimer la réservation
    await db.reservation.delete({
      where: { id: reservationId }
    })

    revalidatePath("/reservations")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting reservation:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
