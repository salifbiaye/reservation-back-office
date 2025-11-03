import { z } from "zod"

export const rejectReservationSchema = z.object({
  rejectionReason: z.string().min(10, "Minimum 10 caractères pour la raison du refus"),
})

export const createReservationSchema = z.object({
  title: z.string().min(5, "Minimum 5 caractères"),
  description: z.string().optional(),
  locationId: z.string().min(1, "Lieu requis"),
  start: z.date(),
  end: z.date(),
}).refine((data) => data.end > data.start, {
  message: "La date de fin doit être après la date de début",
  path: ["end"],
})

export type RejectReservationInput = z.infer<typeof rejectReservationSchema>
export type CreateReservationInput = z.infer<typeof createReservationSchema>
