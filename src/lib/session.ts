import { cache } from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * Request-level cached session fetcher
 *
 * Utilise React.cache() pour mémoriser la session pour la requête actuelle.
 * Évite les multiples queries DB quand auth.api.getSession() est appelé
 * plusieurs fois dans la même requête (middleware + server actions).
 *
 * Le cache est automatiquement vidé entre les requêtes (pas de sessions stale).
 */
export const getCachedSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return session
})

export type Session = Awaited<ReturnType<typeof getCachedSession>>
