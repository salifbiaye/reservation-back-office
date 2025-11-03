import { ResetPasswordForm } from "@/features/auth/reset-password-form"
import { redirect } from "next/navigation"

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    redirect("/forgot-password")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-muted-foreground">
          Choisissez un nouveau mot de passe sécurisé
        </p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  )
}
