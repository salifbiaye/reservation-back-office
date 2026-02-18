"use server"

import { db } from "@/lib/db"
import { headers } from "next/headers"

// Constantes
const MAX_ATTEMPTS = 3
const FIRST_BLOCK_DURATION = 10 * 60 * 1000 // 10 minutes en ms
const SECOND_BLOCK_DURATION = 30 * 60 * 1000 // 30 minutes en ms
const RESET_WINDOW = 24 * 60 * 60 * 1000 // 24 heures

/**
 * Récupère l'IP du client depuis les headers
 */
async function getClientIp(): Promise<string | null> {
  const headersList = await headers()
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    null
  )
}

/**
 * Vérifie si l'email est actuellement bloqué
 * Note: Le blocage est uniquement par email pour éviter de bloquer
 * tous les utilisateurs sur un réseau partagé (ex: wifi universitaire)
 * Retourne: { blocked: boolean, remainingTime?: number, reason?: string }
 */
export async function checkRateLimit(email: string) {
  const now = new Date()

  // Normaliser l'email (lowercase, trim)
  const normalizedEmail = email.toLowerCase().trim()

  // Chercher le dernier blocage actif pour cet email
  const emailBlock = await db.loginAttempt.findFirst({
    where: {
      email: normalizedEmail,
      blockedUntil: { gte: now }
    },
    orderBy: { createdAt: "desc" }
  })

  if (emailBlock) {
    const remainingMs = emailBlock.blockedUntil!.getTime() - now.getTime()
    return {
      blocked: true,
      remainingTime: Math.ceil(remainingMs / 1000), // en secondes
      reason: "email",
      blockLevel: emailBlock.blockLevel
    }
  }

  // Compter les tentatives récentes (dernière heure) pour email uniquement
  const recentEmailAttempts = await db.loginAttempt.count({
    where: {
      email: normalizedEmail,
      success: false,
      blockedUntil: null, // Tentatives non bloquées
      createdAt: {
        gte: new Date(now.getTime() - 60 * 60 * 1000) // 1 heure
      }
    }
  })

  return {
    blocked: false,
    emailAttempts: recentEmailAttempts
  }
}

/**
 * Enregistre une tentative de login (succès ou échec)
 * Si échec et MAX_ATTEMPTS atteint → créer blocage par email uniquement
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean
) {
  const ipAddress = await getClientIp()
  const now = new Date()

  // Normaliser l'email
  const normalizedEmail = email.toLowerCase().trim()

  // Si succès → reset tous les blocages et tentatives pour cet email uniquement
  if (success) {
    await db.loginAttempt.deleteMany({
      where: {
        email: normalizedEmail
      }
    })

    // Créer entrée de succès
    await db.loginAttempt.create({
      data: {
        email: normalizedEmail,
        ipAddress, // On garde l'IP pour les logs/audits
        success: true
      }
    })

    return { success: true }
  }

  // Si échec → vérifier combien de tentatives récentes
  const rateCheck = await checkRateLimit(normalizedEmail)

  if (rateCheck.blocked) {
    // Déjà bloqué, ne rien faire
    return { blocked: true, remainingTime: rateCheck.remainingTime }
  }

  const emailAttempts = rateCheck.emailAttempts || 0

  // Créer l'entrée d'échec
  await db.loginAttempt.create({
    data: {
      email: normalizedEmail,
      ipAddress, // On garde l'IP pour les logs/audits
      success: false
    }
  })

  // Si MAX_ATTEMPTS atteint → créer blocage par email
  if (emailAttempts + 1 >= MAX_ATTEMPTS) {
    // Déterminer le niveau de blocage (1er ou 2ème)
    const lastBlock = await db.loginAttempt.findFirst({
      where: {
        email: normalizedEmail,
        blockedUntil: { not: null }
      },
      orderBy: { createdAt: "desc" }
    })

    // Si dernier blocage > 24h → reset
    const blockLevel = lastBlock &&
      (now.getTime() - lastBlock.createdAt.getTime() < RESET_WINDOW)
      ? lastBlock.blockLevel + 1
      : 1

    const blockDuration = blockLevel === 1
      ? FIRST_BLOCK_DURATION
      : SECOND_BLOCK_DURATION

    const blockedUntil = new Date(now.getTime() + blockDuration)

    // Créer l'entrée de blocage
    await db.loginAttempt.create({
      data: {
        email: normalizedEmail,
        ipAddress, // On garde l'IP pour les logs/audits
        success: false,
        blockedUntil,
        blockLevel: Math.min(blockLevel, 2) // Cap à 2 (30min max)
      }
    })

    console.warn(`🔒 Rate limit triggered: ${normalizedEmail} (IP: ${ipAddress || 'N/A'})`)

    return {
      blocked: true,
      remainingTime: Math.ceil(blockDuration / 1000),
      blockLevel
    }
  }

  return { success: false, attemptsRemaining: MAX_ATTEMPTS - emailAttempts - 1 }
}

/**
 * Reset complet des tentatives (appelé après login Google réussi)
 */
export async function resetLoginAttempts(email: string) {
  const normalizedEmail = email.toLowerCase().trim()

  // Reset uniquement par email, pas par IP
  await db.loginAttempt.deleteMany({
    where: {
      email: normalizedEmail
    }
  })

  console.log(`✅ Rate limit reset for: ${normalizedEmail}`)

  return { success: true }
}
