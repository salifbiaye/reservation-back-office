"use client"

import { authClient } from "@/lib/auth-client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Clock } from "lucide-react"
import { InfoModal } from "@/components/info-modal"

interface VerifyOTPFormProps {
  email: string
}

export function VerifyOTPForm({ email }: VerifyOTPFormProps) {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes en secondes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Compte à rebours
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Formater le temps restant (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleChange = (index: number, value: string) => {
    // Autoriser seulement les chiffres
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError(null)
    setSuccess(null)

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split("")
    while (newOtp.length < 6) newOtp.push("")
    setOtp(newOtp)

    // Focus sur le dernier champ rempli
    const lastFilledIndex = pastedData.length - 1
    inputRefs.current[Math.min(lastFilledIndex, 5)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Veuillez entrer les 6 chiffres du code")
      return
    }

    if (timeLeft <= 0) {
      setError("Le code a expiré. Veuillez en demander un nouveau.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error: authError } = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpValue
      })

      if (authError) {
        // Logger l'erreur complète pour debug
        console.error("OTP Error:", authError)
        
        // Traduire les messages d'erreur en français
        let errorMessage = "Code invalide ou expiré"
        if (authError.message?.toLowerCase().includes("invalid")) {
          errorMessage = "Code invalide. Veuillez vérifier et réessayer."
        } else if (authError.message?.toLowerCase().includes("expired")) {
          errorMessage = "Code expiré. Veuillez en demander un nouveau."
        } else if (authError.message?.toLowerCase().includes("attempts")) {
          errorMessage = "Trop de tentatives. Veuillez demander un nouveau code."
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Email vérifié, rediriger vers le dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("OTP verification error:", err)
      setError("Une erreur est survenue lors de la vérification")
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    setSuccess(null)

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification"
      })

      setSuccess("Un nouveau code a été envoyé à votre email")
      setTimeLeft(300) // Reset le timer à 5 minutes
      setOtp(["", "", "", "", "", ""]) // Vider les champs
      inputRefs.current[0]?.focus() // Focus sur le premier champ
    } catch (err) {
      console.error("Resend OTP error:", err)
      setError("Erreur lors de l'envoi du code")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          Un code de vérification a été envoyé à
        </p>
        <p className="font-semibold text-foreground">{email}</p>
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            📬 <strong>Astuce :</strong> Si vous ne voyez pas l'email, vérifiez votre dossier spam/courrier indésirable.
          </p>
        </div>
      </div>

      {/* Compte à rebours */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className={timeLeft <= 60 ? "text-red-500 font-semibold" : "text-muted-foreground"}>
          Code valide pendant : {formatTime(timeLeft)}
        </span>
      </div>

      {timeLeft <= 0 && (
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm text-center">
          ⏱️ Le code a expiré. Veuillez en demander un nouveau ci-dessous.
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center space-y-2">
          <p>✅ {success}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            📬 Vérifiez votre dossier spam si vous ne le voyez pas.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={timeLeft <= 0}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-background focus:border-violet-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6 || timeLeft <= 0}
          className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Vérification...
            </>
          ) : (
            "Vérifier"
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-violet-400 hover:underline transition-colors disabled:opacity-50"
        >
          {resending ? "Envoi en cours..." : "Renvoyer le code"}
        </button>
      </div>
    </div>
  )
}
