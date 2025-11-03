"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { commissionSchema, type CommissionInput } from "@/schemas/commission"
import {
  parsePaginationParams,
  getPaginationSkipTake,
  buildPaginatedResult,
} from "@/lib/pagination"
import { buildSearchCondition, parseSearchParam } from "@/lib/filters"

export async function getCommissions(params?: {
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

  const where = search ? buildSearchCondition(search, ["name", "description"]) : undefined
  const { skip, take } = getPaginationSkipTake(pagination)

  // Count total
  const total = await db.commission.count({ where })

  // Fetch data
  const commissions = await db.commission.findMany({
    where,
    include: {
      _count: {
        select: {
          members: true,
          locations: true,
        }
      }
    },
    orderBy: {
      name: "asc"
    },
    skip,
    take,
  })

  return buildPaginatedResult(commissions, total, pagination)
}

export async function getCommission(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  const commission = await db.commission.findUnique({
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      locations: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  })

  return commission
}

export async function createCommission(data: CommissionInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const validated = commissionSchema.parse(data)

    await db.commission.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        color: validated.color,
      }
    })

    revalidatePath("/commissions")
    return { success: true }
  } catch (error) {
    console.error("Error creating commission:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function updateCommission(id: string, data: CommissionInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const validated = commissionSchema.parse(data)

    await db.commission.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description || null,
        color: validated.color,
      }
    })

    revalidatePath("/commissions")
    revalidatePath(`/commissions/${id}/edit`)
    return { success: true }
  } catch (error) {
    console.error("Error updating commission:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteCommission(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    // Check if commission has members or locations
    const commission = await db.commission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            locations: true,
          }
        }
      }
    })

    if (!commission) {
      return { success: false, error: "Commission introuvable" }
    }

    if (commission._count.members > 0 || commission._count.locations > 0) {
      return {
        success: false,
        error: "Impossible de supprimer une commission avec des membres ou des lieux"
      }
    }

    await db.commission.delete({
      where: { id }
    })

    revalidatePath("/commissions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting commission:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
