import { NextRequest, NextResponse } from "next/server"
import { getSessionWithCache } from "@/lib/session-cache"
import {db} from "@/lib/db";

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  "/",
  "/login",
  // "/register", // ❌ DÉSACTIVÉ - Pas d'inscription publique en back-office
    "/logout",
  "/verify-otp",
  "/reset-password",
  "/forgot-password"
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permettre l'accès aux routes publiques
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Vérifier la session avec Better Auth
  const session = await getSessionWithCache()
  
  // Redirection uniquement pour les requêtes GET vers /login
  if (session && pathname === "/login" && request.method === "GET") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si pas de session, rediriger vers login
  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }


  // CRITIQUE: Seuls les rôles CEE et ADMIN peuvent accéder au back-office
  if (session.user.role === "STUDENT" && !session.user.email.endsWith("@esp.sn")) {
    await db.user.delete({
      where: { id: session.user.id }
    })

    // Rediriger directement vers /logout avec un paramètre d'erreur
    return NextResponse.redirect(new URL("/logout?error=wrong-role", request.url))
  }
  if (session.user.role === "STUDENT" ) {

    // Rediriger directement vers /logout avec un paramètre d'erreur
    return NextResponse.redirect(new URL("/logout?error=wrong-role", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.png, *.jpg, *.jpeg, *.svg, *.webp (images du dossier public)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp).*)",
  ],
}
