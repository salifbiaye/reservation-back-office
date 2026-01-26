"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { authClient, useSession } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { checkRateLimit, recordLoginAttempt } from "@/actions/auth-rate-limit"
import { translateAuthError } from "@/lib/error-translations"

const GlassInput = ({ error, ...props }: any) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    <input {...props} className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
    {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
  </div>
)

// Helper pour formater le temps restant
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [rateLimitState, setRateLimitState] = useState<{
    blocked: boolean
    remainingTime: number
    blockLevel?: number
  } | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })

  // Afficher l'erreur si redirection depuis middleware
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'wrong-role') {
      setError("root", {
        message: "Accès refusé. Seuls les administrateurs et membres CEE peuvent accéder au back-office. Votre compte doit être créé par un administrateur avec le bon rôle."
      })
    }
  }, [searchParams, setError])

  // Compte à rebours pour le rate limit
  useEffect(() => {
    if (!rateLimitState?.blocked || !rateLimitState.remainingTime) return

    const interval = setInterval(() => {
      setRateLimitState(prev => {
        if (!prev || prev.remainingTime <= 1) {
          clearInterval(interval)
          return null
        }
        return { ...prev, remainingTime: prev.remainingTime - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [rateLimitState])

  const onSubmit = async (data: LoginInput) => {
    // 1. Vérifier rate limit AVANT d'appeler Better Auth
    const rateCheck = await checkRateLimit(data.email)

    if (rateCheck.blocked) {
      setRateLimitState({
        blocked: true,
        remainingTime: rateCheck.remainingTime!,
        blockLevel: rateCheck.blockLevel
      })
      return
    }

    // 2. Tenter la connexion
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password
    })

    if (error) {
      // 3. Enregistrer l'échec
      const result = await recordLoginAttempt(data.email, false)

      if (result.blocked) {
        setRateLimitState({
          blocked: true,
          remainingTime: result.remainingTime!,
          blockLevel: result.blockLevel
        })
      } else {
        const translatedError = translateAuthError(error.message)
        setError("root", {
          message: `${translatedError}. ${result.attemptsRemaining || 0} tentative(s) restante(s).`
        })
      }
      return
    }

    // 4. Succès → enregistrer et vérifier rôle
    await recordLoginAttempt(data.email, true)

    const session = await authClient.getSession()

    if (!["CEE", "ADMIN"].includes(session.data?.user?.role || "")) {
      await authClient.signOut()
      setError("root", { message: "Email ou mot de passe incorrect" })
      return
    }

    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {errors.root.message}
        </div>
      )}

      {rateLimitState?.blocked && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
          <p className="text-red-500 text-sm font-medium">
            🔒 Trop de tentatives de connexion
          </p>
          <p className="text-red-400 text-xs">
            Votre compte est temporairement bloqué.
            Réessayez dans <strong className="font-mono text-red-500">
              {formatTime(rateLimitState.remainingTime)}
            </strong>
          </p>
          <div className="pt-2 border-t border-red-500/20">
            <p className="text-xs text-red-300 mb-2">
              💡 Vous pouvez vous authentifier via Google pour accéder à votre compte.
            </p>
            <p className="text-xs text-red-300">
              Si vous avez oublié votre mot de passe, contactez un administrateur.
            </p>
            <button
              type="button"
              onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <GlassInput
          {...register("email")}
          type="email"
          placeholder="votre.email@exemple.com"
          error={errors.email?.message}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
        <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
            </button>
          </div>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1 px-4">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">

        <a href="/forgot-password" className="text-violet-400 hover:underline">
          Mot de passe oublié ?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || rateLimitState?.blocked}
        className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {rateLimitState?.blocked
          ? "Compte bloqué"
          : isSubmitting
          ? "Connexion..."
          : "Se connecter"}
      </button>
    </form>
  )
}
