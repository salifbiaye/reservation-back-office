"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// Schema pour la mise à jour du profil
const updateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
})

// Schema pour le changement de mot de passe
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "Veuillez confirmer le nouveau mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export async function getProfile() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: "Non authentifié" }
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      commission: {
        select: {
          id: true,
          name: true,
          color: true,
        }
      }
    }
  })

  if (!user) {
    return { error: "Utilisateur non trouvé" }
  }

  return { user }
}

/**
 * Mettre à jour le profil (nom et email)
 */
export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Non authentifié" }
    }

    // Valider les données
    const validated = updateProfileSchema.parse(data)

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (validated.email !== session.user.email) {
      const existingUser = await db.user.findUnique({
        where: { email: validated.email }
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return { error: "Cet email est déjà utilisé" }
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        email: validated.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    revalidatePath("/profile")

    return {
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("Error updating profile:", error)
    return { error: "Une erreur est survenue lors de la mise à jour" }
  }
}

/**
 * Changer le mot de passe
 */
export async function changePassword(data: z.infer<typeof changePasswordSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return { error: "Non authentifié" }
    }

    // Valider les données
    const validated = changePasswordSchema.parse(data)

    // Récupérer le compte avec le mot de passe
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential",
      }
    })

    if (!account || !account.password) {
      return { error: "Impossible de trouver votre compte" }
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(validated.currentPassword, account.password)

    if (!isValidPassword) {
      return { error: "Le mot de passe actuel est incorrect" }
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    // Mettre à jour le mot de passe
    await db.account.update({
      where: { id: account.id },
      data: {
        password: hashedPassword,
      }
    })

    revalidatePath("/profile")

    return {
      success: true,
      message: "Mot de passe modifié avec succès"
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("Error changing password:", error)
    return { error: "Une erreur est survenue lors du changement de mot de passe" }
  }
}
