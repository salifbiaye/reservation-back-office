import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "@/lib/db"
import { Resend } from "resend"
import { render } from "@react-email/render"
import OTPEmail from "../../emails/otp-email"
import bcrypt from "bcryptjs"

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql"
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "STUDENT"
      },
      commissionId: {
        type: "string",
        required: false
      }
    }
  },



  emailAndPassword: {
    enabled: true,
    autoSignIn: false ,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    password: {
      hash: async (password: string): Promise<string> => {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
      },
      verify: async ({ password, hash }: { password: string; hash: string }): Promise<boolean> => {
        return await bcrypt.compare(password, hash)
      }
    },
    // Fonction pour l'envoi d'email de reset de mot de passe
    async sendResetPassword({ user, url, token }) {
      await resend.emails.send({
        from: "Acme <onboarding@shadowfit-app.space>",
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour ${user.name},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Réinitialiser mon mot de passe
            </a>
            <p>Ce lien est valide pendant 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          </div>
        `
      })
    },

    // Callback après réinitialisation réussie
    async onPasswordReset({ user }) {
      console.log(`Mot de passe réinitialisé pour: ${user.email}`)
    },

    // Durée de validité du token de reset (1 heure)
    resetPasswordTokenExpiresIn: 3600,
  },
  account: {
    accountLinking: {
      // Activer le linking: connecte Google/GitHub aux comptes existants
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectUri: process.env.GOOGLE_REDIRECT_URI as string,
    }
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 3,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,

      async sendVerificationOTP({ email, otp, type }) {
        // BACK OFFICE: Aucune restriction d'email
        // Les admins et CEE peuvent utiliser n'importe quel email pro

        const subjects = {
          "sign-in": "Votre code de connexion - ESP Réservation Back Office",
          "email-verification": "Vérifiez votre email - ESP Réservation Back Office",
          "forget-password": "Réinitialisation de mot de passe"
        }

        const html = await render(OTPEmail({ otp, type, email }))

        await resend.emails.send({
          from: "Acme <onboarding@shadowfit-app.space>",
          to: email,
          subject: subjects[type] || "Code de vérification",
          html
        })
      }
    }),

    // Plugin Next.js (doit être le dernier)
    nextCookies()
  ],

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  ],

  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    }
  }
})
