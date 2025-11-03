import Link from "next/link"
import { LoginForm } from "@/features/auth/login-form"
import { GoogleButton } from "@/features/auth/google-button"
import {Suspense} from "react";
import Loading from "@/app/loading";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Bienvenue
        </h1>
        <p className="text-muted-foreground">
          Connectez-vous à votre espace étudiant ESP
        </p>
      </div>

        <Suspense fallback={<Loading/>}>
            <LoginForm />
        </Suspense>

      <div className="relative flex items-center justify-center">
        <span className="w-full border-t border-border"></span>
        <span className="px-4 text-sm text-muted-foreground bg-background absolute">
          Ou continuer avec
        </span>
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        Besoin d'un compte ? Contactez un administrateur.
      </p>
    </div>
  )
}
