"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"

export async function getCalendarData() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: "Non authentifié" }
  }

  const userRole = session.user.role

  try {
    // Get locations with commission info
    const locations = await db.location.findMany({
      select: {
        id: true,
        name: true,
        commission: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    // Get reservations based on role
    // IMPORTANT: Calendar only shows ACCEPTED reservations
    let reservationsWhere: any = {
      status: "ACCEPTED", // Seulement les réservations acceptées
    }

    // if (userRole === "CEE") {
    //   // CEE can only see reservations for locations in their commission
    //   const user = await db.user.findUnique({
    //     where: { id: session.user.id },
    //     select: { commissionId: true },
    //   })
    //
    //   if (!user?.commissionId) {
    //     return { error: "Commission non trouvée" }
    //   }
    //
    //   reservationsWhere = {
    //     status: "ACCEPTED",
    //     location: {
    //       commissionId: user.commissionId,
    //     },
    //   }
    // }
    // ADMIN can see all ACCEPTED reservations

    const reservations = await db.reservation.findMany({
      where: reservationsWhere,
      select: {
        id: true,
        title: true,
        description: true,
        start: true,
        end: true,
        status: true,
        location: {
          select: {
            id: true,
            name: true,
            commission: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { start: "asc" },
    })

    return {
      success: true,
      locations,
      reservations,
    }
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    return { error: "Erreur lors de la récupération des données" }
  }
}
