import { z } from "zod"

export const locationSchema = z.object({
  name: z.string().min(3, "Minimum 3 caractères"),
  description: z.string().optional(),
  maxDurationHours: z.number().int().positive().optional(),
  commissionId: z.string().min(1, "Commission requise"),
})

export type LocationInput = z.infer<typeof locationSchema>
