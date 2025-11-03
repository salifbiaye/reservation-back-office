import { z } from "zod"

// Validation email (back-office accepts any email domain)
const emailValidation = z.string()
  .email("Email invalide")

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(8, "Minimum 8 caractères"),
  rememberMe: z.boolean().optional()
})

export const registerSchema = z.object({
  name: z.string().min(3, "Minimum 3 caractères"),
  email: emailValidation,
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

export const forgotPasswordSchema = z.object({
  email: emailValidation
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
