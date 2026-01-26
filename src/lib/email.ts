import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import NewReservationNotificationEmail from "../../emails/new-reservation-notification-email"

// Configuration du transporteur Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Fonction helper pour envoyer un email
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"ESP Réservation" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("✅ Email envoyé:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Erreur envoi email:", error)
    throw error
  }
}

// Fonction pour envoyer une notification de nouvelle réservation aux membres CEE
export async function sendNewReservationNotificationEmail(
  to: string,
  data: {
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
) {
  const html = await render(NewReservationNotificationEmail(data))
  
  return sendEmail({
    to,
    subject: `🔔 Nouvelle demande de réservation - ${data.locationName}`,
    html,
  })
}

// Fonction pour envoyer un email de réservation acceptée
export async function sendReservationAcceptedEmail(
  to: string,
  data: {
    studentName: string
    reservationTitle: string
    locationName: string
    startDate: Date
    endDate: Date
    validatedBy: string
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Réservation Acceptée</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">Bonjour <strong>${data.studentName}</strong>,</p>
        
        <p style="font-size: 16px; color: #374151;">
          Bonne nouvelle ! Votre demande de réservation a été <strong style="color: #10b981;">acceptée</strong>.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #1f2937;">📋 Détails de la réservation</h3>
          <p style="margin: 8px 0;"><strong>Titre :</strong> ${data.reservationTitle}</p>
          <p style="margin: 8px 0;"><strong>Salle :</strong> ${data.locationName}</p>
          <p style="margin: 8px 0;"><strong>Début :</strong> ${data.startDate.toLocaleString('fr-FR')}</p>
          <p style="margin: 8px 0;"><strong>Fin :</strong> ${data.endDate.toLocaleString('fr-FR')}</p>
          <p style="margin: 8px 0;"><strong>Validé par :</strong> ${data.validatedBy}</p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Vous pouvez consulter tous les détails dans votre espace de réservation.
        </p>
      </div>
    </div>
  `
  
  return sendEmail({
    to,
    subject: `✅ Réservation acceptée - ${data.locationName}`,
    html,
  })
}

// Fonction pour envoyer un email de réservation rejetée
export async function sendReservationRejectedEmail(
  to: string,
  data: {
    studentName: string
    reservationTitle: string
    locationName: string
    startDate: Date
    endDate: Date
    rejectionReason: string
    validatedBy: string
  }
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">❌ Réservation Refusée</h1>
      </div>
      
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">Bonjour <strong>${data.studentName}</strong>,</p>
        
        <p style="font-size: 16px; color: #374151;">
          Nous sommes désolés, mais votre demande de réservation a été <strong style="color: #ef4444;">refusée</strong>.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #1f2937;">📋 Détails de la réservation</h3>
          <p style="margin: 8px 0;"><strong>Titre :</strong> ${data.reservationTitle}</p>
          <p style="margin: 8px 0;"><strong>Salle :</strong> ${data.locationName}</p>
          <p style="margin: 8px 0;"><strong>Début :</strong> ${data.startDate.toLocaleString('fr-FR')}</p>
          <p style="margin: 8px 0;"><strong>Fin :</strong> ${data.endDate.toLocaleString('fr-FR')}</p>
          <p style="margin: 8px 0;"><strong>Traité par :</strong> ${data.validatedBy}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h4 style="margin-top: 0; color: #991b1b;">Raison du refus :</h4>
          <p style="margin: 0; color: #7f1d1d;">${data.rejectionReason}</p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          N'hésitez pas à soumettre une nouvelle demande avec les modifications nécessaires.
        </p>
      </div>
    </div>
  `
  
  return sendEmail({
    to,
    subject: `❌ Réservation refusée - ${data.locationName}`,
    html,
  })
}


// Fonction pour envoyer le rapport mensuel aux admins
export async function sendMonthlyReportEmail(
  to: string[],
  data: {
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
    period: string
  }
) {
  const acceptanceRate = data.stats.total > 0 
    ? ((data.stats.accepted / data.stats.total) * 100).toFixed(1)
    : "0"

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">📊 Rapport Mensuel</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">
          ${data.month} ${data.year} (mois ${data.period})
        </p>
      </div>
      
      <div style="padding: 40px; background: #f9fafb;">
        <!-- Statistiques globales -->
        <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            📈 Statistiques Globales
          </h2>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px;">
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Total des demandes</div>
              <div style="font-size: 32px; font-weight: bold; color: #1f2937;">${data.stats.total}</div>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Acceptées</div>
              <div style="font-size: 32px; font-weight: bold; color: #10b981;">${data.stats.accepted}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Taux: ${acceptanceRate}%</div>
            </div>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Refusées</div>
              <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${data.stats.rejected}</div>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">En attente</div>
              <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${data.stats.pending}</div>
            </div>
          </div>
        </div>

        <!-- Par commission -->
        ${data.byCommission.length > 0 ? `
        <div style="background: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            🏢 Répartition par Commission
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Commission</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Total</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Acceptées</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Refusées</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">En attente</th>
              </tr>
            </thead>
            <tbody>
              ${data.byCommission.map(comm => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; font-weight: 500;">${comm.name}</td>
                  <td style="padding: 12px; text-align: center;">${comm.total}</td>
                  <td style="padding: 12px; text-align: center; color: #10b981;">${comm.accepted}</td>
                  <td style="padding: 12px; text-align: center; color: #ef4444;">${comm.rejected}</td>
                  <td style="padding: 12px; text-align: center; color: #f59e0b;">${comm.pending}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Top lieux -->
        ${data.topLocations.length > 0 ? `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            🏆 Top 10 des Salles les Plus Demandées
          </h2>
          
          <div style="margin-top: 20px;">
            ${data.topLocations.map((loc, index) => {
              const maxCount = data.topLocations[0].count
              const percentage = (loc.count / maxCount) * 100
              return `
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 500; color: #1f2937;">${index + 1}. ${loc.name}</span>
                    <span style="font-weight: bold; color: #3b82f6;">${loc.count} demandes</span>
                  </div>
                  <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #3b82f6, #2563eb); height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Ce rapport a été généré automatiquement par le système ESP Réservation.</p>
          <p style="margin-top: 10px;">
            Pour plus de détails, connectez-vous à 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}" style="color: #3b82f6; text-decoration: none;">
              l'espace de gestion
            </a>
          </p>
        </div>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"ESP Réservation - Rapport Mensuel" <${process.env.GMAIL_USER}>`,
      to: to.join(', '),
      subject: `📊 Rapport Mensuel - ${data.month} ${data.year}`,
      html,
    })

    console.log("✅ Rapport mensuel envoyé:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Erreur envoi rapport mensuel:", error)
    return { success: false, error: String(error) }
  }
}
