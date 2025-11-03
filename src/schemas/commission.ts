import { z } from "zod"

export const commissionSchema = z.object({
  name: z.string().min(3, "Minimum 3 caractères"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide").default("#3b82f6"),
})

export type CommissionInput = z.infer<typeof commissionSchema>
