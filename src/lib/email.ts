import { Resend } from "resend"
import { render } from "@react-email/render"
import ReservationAccepted from "../../emails/reservation-accepted"
import ReservationRejected from "../../emails/reservation-rejected"
import NewReservationNotification from "../../emails/new-reservation-notification-email"
// TODO: Ajouter le template monthly-report.tsx dans emails/
import MonthlyReport from "../../emails/monthly-report"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "ESP Réservation <noreply@shadowfit-app.space>"

// Types
interface ReservationAcceptedData {
  studentName: string
  reservationTitle: string
  locationName: string
  startDate: Date
  endDate: Date
  validatedBy: string
}

interface ReservationRejectedData {
  studentName: string
  reservationTitle: string
  locationName: string
  startDate: Date
  endDate: Date
  rejectionReason: string
  validatedBy: string
}

interface NewReservationNotificationData {
  ceeMemberName: string
  studentName: string
  studentEmail: string
  title: string
  description?: string
  locationName: string
  commissionName: string
  start: Date
  end: Date
}

interface MonthlyReportData {
  month: string
  year: number
  stats: {
    total: number
    pending: number
    accepted: number
    rejected: number
  }
  byCommission: Array<{
    name: string
    total: number
    accepted: number
    rejected: number
    pending: number
  }>
  topLocations: Array<{
    name: string
    count: number
  }>
}

/**
 * Envoyer la notification de réservation acceptée
 */
export async function sendReservationAcceptedEmail(
  to: string,
  data: ReservationAcceptedData
) {
  try {
    const html = await render(ReservationAccepted(data))

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `✅ Réservation acceptée - ${data.reservationTitle}`,
      html,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending reservation accepted email:", error)
    return { success: false, error }
  }
}

/**
 * Envoyer la notification de réservation rejetée
 */
export async function sendReservationRejectedEmail(
  to: string,
  data: ReservationRejectedData
) {
  try {
    const html = await render(ReservationRejected(data))

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Réservation refusée - ${data.reservationTitle}`,
      html,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending reservation rejected email:", error)
    return { success: false, error }
  }
}

/**
 * Envoyer une notification aux membres CEE lors d'une nouvelle demande de réservation
 * @param to Array of email addresses (CEE members)
 * @param data Reservation notification data
 */
export async function sendNewReservationNotificationEmail(
  to: string | string[],
  data: NewReservationNotificationData
) {
  try {
    const html = await render(NewReservationNotification(data))

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject: `🔔 Nouvelle demande de réservation - ${data.title}`,
      html,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending new reservation notification email:", error)
    return { success: false, error }
  }
}

/**
 * Envoyer le rapport mensuel à plusieurs destinataires
 * TODO: Réactiver quand monthly-report.tsx sera disponible
 */

export async function sendMonthlyReportEmail(
  to: string[],
  data: MonthlyReportData
) {
  try {
    const html = await render(MonthlyReport(data))

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `📊 Rapport Mensuel - ${data.month} ${data.year}`,
      html,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error sending monthly report email:", error)
    return { success: false, error }
  }
}

