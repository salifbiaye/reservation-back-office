import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface CachedSession {
  data: any
  timestamp: number
}

// Cache en mémoire avec TTL de 60 secondes (augmenté pour meilleures performances)
const sessionCache = new Map<string, CachedSession>()
const CACHE_TTL = 60000 // 60 secondes

// Nettoyer le cache toutes les 2 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      sessionCache.delete(key)
    }
  }
}, 120000)

export async function getSessionWithCache() {
  const headersList = await headers()
  const sessionToken = headersList.get("cookie")?.match(/better-auth\.session_token=([^;]+)/)?.[1]
  
  if (!sessionToken) {
    return null
  }

  // Vérifier le cache
  const cached = sessionCache.get(sessionToken)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }

  // Récupérer depuis Better Auth
  const session = await auth.api.getSession({
    headers: headersList
  })

  // Mettre en cache
  if (session) {
    sessionCache.set(sessionToken, {
      data: session,
      timestamp: now
    })
  }

  return session
}
