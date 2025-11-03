"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "button" | "link"
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({
  variant = "button",
  className = "",
  children
}: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/logout")
  }

  if (variant === "link") {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center gap-2 text-sm hover:text-red-500 transition-colors ${className}`}
      >
        <LogOut className="w-4 h-4" />
        {children || "Se déconnecter"}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {children || "Se déconnecter"}
    </button>
  )
}
