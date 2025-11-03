"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { authClient, useSession } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"

const GlassInput = ({ error, ...props }: any) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    <input {...props} className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
    {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
  </div>
)

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
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

  const onSubmit = async (data: LoginInput) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password
    })

    if (error) {
      setError("root", { message: error.message || "Identifiants incorrects" })
      return
    }

    // Vérifier le rôle après connexion
    const session = await authClient.getSession()

    if (!["CEE", "ADMIN"].includes(session.data?.user?.role || "")) {
      await authClient.signOut()
      setError("root", { message: "Accès réservé aux membres CEE et administrateurs" })
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
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  )
}
