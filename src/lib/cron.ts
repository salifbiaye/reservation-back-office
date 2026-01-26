import { db } from "@/lib/db"

/**
 * Nettoie les tentatives de connexion > 7 jours
 * À appeler via un cron job ou lors du démarrage
 */
export async function cleanupOldLoginAttempts() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const deleted = await db.loginAttempt.deleteMany({
      where: {
        createdAt: { lt: sevenDaysAgo }
      }
    })

    console.log(`🧹 Cleaned up ${deleted.count} old login attempts`)
    return deleted.count
  } catch (error) {
    console.error("Failed to cleanup old login attempts:", error)
    return 0
  }
}

/**
 * Nettoie les tentatives expirées (plus de blocage actif)
 * À exécuter plus fréquemment (ex: toutes les heures)
 */
export async function cleanupExpiredBlocks() {
  try {
    const now = new Date()

    const deleted = await db.loginAttempt.deleteMany({
      where: {
        blockedUntil: {
          lt: now,
          not: null
        }
      }
    })

    console.log(`🧹 Cleaned up ${deleted.count} expired login blocks`)
    return deleted.count
  } catch (error) {
    console.error("Failed to cleanup expired blocks:", error)
    return 0
  }
}
