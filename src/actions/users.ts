"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import {
  updateUserCommissionSchema,
  createUserSchema,
  updateUserSchema,
  type UpdateUserCommissionInput,
  type CreateUserInput,
  type UpdateUserInput
} from "@/schemas/user"
import {
  parsePaginationParams,
  getPaginationSkipTake,
  buildPaginatedResult,
} from "@/lib/pagination"
import { buildSearchCondition, parseSearchParam, parseRoleFilter, parseCommissionFilter } from "@/lib/filters"
import { Resend } from "resend"
import { render } from "@react-email/render"
import WelcomeUserEmail from "../../emails/welcome-user-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getUsers(params?: {
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
  const role = params?.searchParams ? parseRoleFilter(params.searchParams) : null
  const commissionId = params?.searchParams ? parseCommissionFilter(params.searchParams) : null

  // Construire where
  const searchWhere = search ? buildSearchCondition(search, ["name", "email"]) : undefined
  const roleWhere = role ? { role } : undefined
  const commissionWhere = commissionId ? { commissionId } : undefined

  const where = {
    AND: [searchWhere, roleWhere, commissionWhere].filter(Boolean)
  }

  const { skip, take } = getPaginationSkipTake(pagination)

  // Count total
  const total = await db.user.count({ where })

  // Fetch data
  const users = await db.user.findMany({
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
          reservations: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take,
  })

  return buildPaginatedResult(users, total, pagination)
}

export async function getUser(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  const user = await db.user.findUnique({
    where: { id },
    include: {
      commission: true,
      reservations: {
        include: {
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
      }
    }
  })

  return user
}

export async function getCommissionsForSelect() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Non autorisé" }
  }

  const commissions = await db.commission.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
    orderBy: {
      name: "asc"
    }
  })

  return commissions
}

export async function createUser(data: CreateUserInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const validated = createUserSchema.parse(data)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.email }
    })

    if (existingUser) {
      return { success: false, error: "Cet email est déjà utilisé" }
    }

    // If role is CEE, validate commission exists
    if (validated.role === "CEE" && validated.commissionId) {
      const commission = await db.commission.findUnique({
        where: { id: validated.commissionId }
      })

      if (!commission) {
        return { success: false, error: "Commission introuvable" }
      }
    }

    // Generate default password (longer for security, min 8 chars)
    const defaultPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)

    // Hash password with bcrypt - use async for better security
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Create user and account manually without creating a session
    const user = await db.$transaction(async (tx) => {
      // Create user with auto-verified email
      const newUser = await tx.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          role: validated.role,
          commissionId: validated.role === "CEE" ? validated.commissionId : undefined,
          emailVerified: true, // Auto-verified since created by admin
        }
      })

      // Create account with password (Better Auth uses bcrypt hash)
      // The password field should contain the bcrypt hash starting with $2a$ or $2b$
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.id,
          providerId: "credential",
          password: hashedPassword,
        }
      })

      return newUser
    })

    // Send welcome email with credentials
    try {
      const html = await render(WelcomeUserEmail({
        name: user.name,
        email: user.email,
        password: defaultPassword,
        role: user.role
      }))

      await resend.emails.send({
        from: "ESP Réservation <onboarding@resend.dev>",
        to: user.email,
        subject: "Bienvenue sur ESP Réservation - Vos identifiants de connexion",
        html
      })

      console.log(`✅ Welcome email sent to: ${user.email}`)
    } catch (emailError) {
      // Log error but don't fail user creation
      console.error("❌ Failed to send welcome email:", emailError)
    }

    revalidatePath("/users")
    return { success: true, user, defaultPassword }
  } catch (error) {
    console.error("Error creating user:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    const validated = updateUserSchema.parse(data)

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const existingUser = await db.user.findFirst({
      where: {
        email: validated.email,
        NOT: { id: userId }
      }
    })

    if (existingUser) {
      return { success: false, error: "Cet email est déjà utilisé" }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: validated.name,
        email: validated.email,
      }
    })

    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function updateUserCommission(userId: string, data: UpdateUserCommissionInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    // Vérifier que l'utilisateur est bien un CEE
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return { success: false, error: "Utilisateur introuvable" }
    }



    const validated = updateUserCommissionSchema.parse(data)

    // Vérifier que la commission existe
    const commission = await db.commission.findUnique({
      where: { id: validated.commissionId }
    })

    if (!commission) {
      return { success: false, error: "Commission introuvable" }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        commissionId: validated.commissionId,
      }
    })

    revalidatePath("/users")
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating user commission:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Non autorisé" }
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte" }
    }

    // Check if user has reservations
    const count = await db.reservation.count({
      where: { userId }
    })

    if (count > 0) {
      return {
        success: false,
        error: "Impossible de supprimer un utilisateur avec des réservations existantes"
      }
    }

    await db.user.delete({
      where: { id: userId }
    })

    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
