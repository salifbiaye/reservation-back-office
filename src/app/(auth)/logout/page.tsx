"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        await authClient.signOut()
        router.push("/login")
      } catch (error) {
        console.error("Logout error:", error)
        // Rediriger quand même vers login en cas d'erreur
        router.push("/login")
      }
    }

    logout()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Déconnexion en cours...</p>
    </div>
  )
}
