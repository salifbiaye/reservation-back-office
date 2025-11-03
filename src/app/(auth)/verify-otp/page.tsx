import { VerifyOTPForm } from "@/features/auth/verify-otp-form"
import { redirect } from "next/navigation"

interface VerifyOTPPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyOTPPage({ searchParams }: VerifyOTPPageProps) {
  const params = await searchParams
  const email = params.email

  if (!email) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Vérification
        </h1>
        <p className="text-muted-foreground">
          Entrez le code envoyé à votre email
        </p>
      </div>

      <VerifyOTPForm email={email} />
    </div>
  )
}
