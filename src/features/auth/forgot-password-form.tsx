"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

const GlassInput = ({ error, ...props }: any) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    <input {...props} className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
    {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
  </div>
)

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    const { error } = await authClient.forgetPassword({
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError("root", { message: error.message || "Erreur lors de l'envoi" })
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Email envoyé !</h2>
          <p className="text-muted-foreground">
            Consultez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        <a
          href="/login"
          className="inline-block text-violet-400 hover:underline"
        >
          Retour à la connexion
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {errors.root.message}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-muted-foreground">
          Email (@esp.sn)
        </label>
        <GlassInput
          {...register("email")}
          type="email"
          placeholder="votrenom@esp.sn"
          error={errors.email?.message}
        />
        <p className="text-xs text-muted-foreground mt-2 px-4">
          Vous recevrez un lien pour réinitialiser votre mot de passe
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Envoi..." : "Envoyer le lien"}
      </button>
    </form>
  )
}
