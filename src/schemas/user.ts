import { z } from "zod"

// Pour la création d'un utilisateur par l'admin (pas de register classique)
export const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["CEE", "ADMIN"], {
    required_error: "Le rôle est requis"
  }),
  commissionId: z.string().optional(),
}).refine((data) => {
  // Si le rôle est CEE, la commission est obligatoire
  if (data.role === "CEE" && !data.commissionId) {
    return false
  }
  return true
}, {
  message: "La commission est requise pour les membres CEE",
  path: ["commissionId"]
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// Schéma pour changer la commission d'un utilisateur CEE
export const updateUserCommissionSchema = z.object({
  commissionId: z.string().min(1, "Commission requise"),
})

export type UpdateUserCommissionInput = z.infer<typeof updateUserCommissionSchema>

// Schéma pour mettre à jour un utilisateur (nom et email uniquement, pas le rôle)
export const updateUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
