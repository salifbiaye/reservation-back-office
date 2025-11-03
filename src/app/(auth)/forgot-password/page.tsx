import Link from "next/link"
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Mot de passe oublié ?
        </h1>
        <p className="text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
