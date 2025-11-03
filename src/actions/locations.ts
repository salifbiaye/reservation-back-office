"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { locationSchema, type LocationInput } from "@/schemas/location"

import {
  parsePaginationParams,
  getPaginationSkipTake,
  buildPaginatedResult,
} from "@/lib/pagination"
import { buildSearchCondition, parseSearchParam, parseCommissionFilter } from "@/lib/filters"

export async function getLocations(params?: {
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  // Parser pagination et filtres
  const pagination = params?.searchParams
    ? parsePaginationParams(params.searchParams, { limit: 10 })
    : { page: 1, limit: 10 }

  const search = params?.searchParams ? parseSearchParam(params.searchParams, "search") : null
  const commissionId = params?.searchParams ? parseCommissionFilter(params.searchParams) : null

  // Construire where
  const searchWhere = search ? buildSearchCondition(search, ["name", "description"]) : undefined
  const commissionWhere = commissionId ? { commissionId } : undefined

  const where = {
    AND: [searchWhere, commissionWhere].filter(Boolean)
  }

  const { skip, take } = getPaginationSkipTake(pagination)

  // Count total
  const total = await db.location.count({ where })

  // Fetch data
  const locations = await db.location.findMany({
    where,
    include: {
      commission: {
        select: {
          id: true,
          name: true,
          color: true,
        }
      },
      _count: {
        select: {
          reservations: true
        }
      }
    },
    orderBy: {
      name: "asc"
    },
    skip,
    take,
  })

  return buildPaginatedResult(locations, total, pagination)
}

export async function getLocation(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  const location = await db.location.findUnique({
    where: { id },
    include: {
      commission: true,
    }
  })

  return location
}

export async function createLocation(data: LocationInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const validated = locationSchema.parse(data)

    await db.location.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        maxDurationHours: validated.maxDurationHours || null,
        commissionId: validated.commissionId,
      }
    })

    revalidatePath("/locations")
    return { success: true }
  } catch (error) {
    console.error("Error creating location:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function updateLocation(id: string, data: LocationInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const validated = locationSchema.parse(data)

    await db.location.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description || null,
        maxDurationHours: validated.maxDurationHours || null,
        commissionId: validated.commissionId,
      }
    })

    revalidatePath("/locations")
    revalidatePath(`/locations/${id}/edit`)
    return { success: true }
  } catch (error) {
    console.error("Error updating location:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteLocation(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    // Check if location has reservations
    const count = await db.reservation.count({
      where: { locationId: id }
    })

    if (count > 0) {
      return {
        success: false,
        error: "Impossible de supprimer un lieu avec des réservations existantes"
      }
    }

    await db.location.delete({
      where: { id }
    })

    revalidatePath("/locations")
    return { success: true }
  } catch (error) {
    console.error("Error deleting location:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

/**
 * Récupérer les locations pour les selects
 * ADMIN: toutes les locations
 * CEE: seulement les locations de sa commission
 */
export async function getLocationsForSelect() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  // Condition where selon le rôle
  const where = session.user.role === "ADMIN"
    ? {}
    : {
        commission: {
          members: {
            some: { id: session.user.id }
          }
        }
      }

  const locations = await db.location.findMany({
    where,
    select: {
      id: true,
      name: true,
      commission: {
        select: {
          name: true,
          color: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  return locations
}
