import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { sendMonthlyReportEmail } from "@/lib/email"

/**
 * API pour envoyer le rapport mensuel aux admins
 * Endpoint: /api/cron/monthly-report
 * Query params: ?period=current|previous (default: previous)
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le paramètre period de l'URL
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "previous" // "current" ou "previous"

    console.log(`🚀 Starting monthly report for ${period} month...`)

    // Récupérer tous les admins
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true }
    })

    if (admins.length === 0) {
      console.log("⚠️ No admins found")
      return NextResponse.json(
          { message: "No admins to send report to" },
          { status: 200 }
      )
    }

    // Calculer le mois selon le paramètre
    const now = new Date()
    let targetMonth: Date
    let monthStart: Date
    let monthEnd: Date

    if (period === "current") {
      // Mois en cours
      targetMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else {
      // Mois précédent (par défaut)
      targetMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1, 0, 0, 0, 0)
      monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    console.log(`📅 Period: ${format(monthStart, "dd/MM/yyyy")} - ${format(monthEnd, "dd/MM/yyyy")}`)

    // Récupérer toutes les réservations de la période
    const reservations = await db.reservation.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      include: {
        location: {
          include: {
            commission: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })

    // Calculer les statistiques
    const stats = {
      total: reservations.length,
      pending: reservations.filter(r => r.status === "PENDING").length,
      accepted: reservations.filter(r => r.status === "ACCEPTED").length,
      rejected: reservations.filter(r => r.status === "REJECTED").length,
    }

    // Grouper par commission
    const commissionMap: Record<string, any> = {}
    reservations.forEach(res => {
      const commissionName = res.location.commission.name
      if (!commissionMap[commissionName]) {
        commissionMap[commissionName] = {
          name: commissionName,
          total: 0,
          accepted: 0,
          rejected: 0,
          pending: 0,
        }
      }
      commissionMap[commissionName].total++
      if (res.status === "ACCEPTED") commissionMap[commissionName].accepted++
      if (res.status === "REJECTED") commissionMap[commissionName].rejected++
      if (res.status === "PENDING") commissionMap[commissionName].pending++
    })

    const byCommission = Object.values(commissionMap)

    // Top 10 lieux les plus demandés
    const locationMap: Record<string, number> = {}
    reservations.forEach(res => {
      const locationName = res.location.name
      locationMap[locationName] = (locationMap[locationName] || 0) + 1
    })

    const topLocations = Object.entries(locationMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

    // Préparer les données pour l'email
    const emailData = {
      month: format(targetMonth, "MMMM", { locale: fr }),
      year: targetMonth.getFullYear(),
      stats,
      byCommission,
      topLocations,
      period: period === "current" ? "en cours" : "précédent"
    }

    // Envoyer l'email à tous les admins
    const adminEmails = admins.map(admin => admin.email)
    const result = await sendMonthlyReportEmail(adminEmails, emailData)

    if (!result.success) {
      console.error("❌ Error sending report email:", result.error)
      return NextResponse.json(
          { error: "Erreur lors de l'envoi du rapport" },
          { status: 500 }
      )
    }

    console.log(`✅ Monthly report sent successfully to ${adminEmails.length} admins`)
    console.log(`📊 Stats: ${stats.total} total reservations for ${period} month`)

    return NextResponse.json({
      success: true,
      message: `Rapport du mois ${period === "current" ? "en cours" : "précédent"} envoyé à ${adminEmails.length} administrateurs`,
      stats,
      period: period === "current" ? "current" : "previous",
      dateRange: {
        start: format(monthStart, "dd/MM/yyyy", { locale: fr }),
        end: format(monthEnd, "dd/MM/yyyy", { locale: fr })
      }
    })

  } catch (error) {
    console.error("❌ Monthly report error:", error)
    return NextResponse.json(
        { error: "Erreur lors de la génération du rapport" },
        { status: 500 }
    )
  }
}