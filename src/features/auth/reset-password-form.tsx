"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token
    })

    if (error) {
      setError("root", { message: error.message || "Token invalide ou expiré" })
      return
    }

    router.push("/login?success=password-reset")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {errors.root.message}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-muted-foreground">Nouveau mot de passe</label>
        <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
              {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
            </button>
          </div>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1 px-4">{errors.password.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Confirmer le mot de passe</label>
        <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmez votre mot de passe"
              className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-3 flex items-center">
              {showConfirm ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
            </button>
          </div>
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 px-4">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  )
}
