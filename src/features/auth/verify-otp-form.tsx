"use client"

import { authClient } from "@/lib/auth-client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { InfoModal } from "@/components/info-modal"

interface VerifyOTPFormProps {
  email: string
}

export function VerifyOTPForm({ email }: VerifyOTPFormProps) {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    // Autoriser seulement les chiffres
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError(null)

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

    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpValue
      })

      if (authError) {
        setError(authError.message || "Code invalide ou expiré")
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

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification"
      })

      setShowSuccessModal(true)
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
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border bg-background focus:border-violet-400 focus:outline-none transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
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

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Code envoyé"
        type="success"
      >
        Un nouveau code de vérification a été envoyé à votre email <strong>{email}</strong>
      </InfoModal>
    </div>
  )
}
