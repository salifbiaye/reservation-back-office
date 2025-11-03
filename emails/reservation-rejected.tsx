import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ReservationRejectedProps {
  studentName: string
  reservationTitle: string
  locationName: string
  startDate: Date
  endDate: Date
  rejectionReason: string
  validatedBy: string
}

export default function ReservationRejected({
  studentName,
  reservationTitle,
  locationName,
  startDate,
  endDate,
  rejectionReason,
  validatedBy,
}: ReservationRejectedProps) {
  const formattedStartDate = format(new Date(startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
  const formattedEndDate = format(new Date(endDate), "HH:mm", { locale: fr })

  return (
    <Html>
      <Head />
      <Preview>Votre réservation a été refusée - {reservationTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>ESP Réservation</Heading>
            <Text style={tagline}>École Supérieure Polytechnique</Text>
          </Section>

          {/* Status Badge */}
          <Section style={content}>
            <Section style={statusBadge}>
              <Text style={statusText}>❌ Réservation refusée</Text>
            </Section>

            <Heading style={h1}>Demande de réservation refusée</Heading>

            <Text style={text}>
              Bonjour {studentName},
            </Text>

            <Text style={text}>
              Malheureusement, votre demande de réservation a été <strong style={rejectText}>refusée</strong> par la commission.
            </Text>

            {/* Reservation Details */}
            <Section style={detailsBox}>
              <Heading style={detailsHeading}>📋 Détails de la demande</Heading>

              <Section style={detailRow}>
                <Text style={detailLabel}>📌 Titre</Text>
                <Text style={detailValue}>{reservationTitle}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>📍 Lieu</Text>
                <Text style={detailValue}>{locationName}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>📅 Date et heure demandées</Text>
                <Text style={detailValue}>
                  {formattedStartDate}
                  <br />
                  Jusqu'à {formattedEndDate}
                </Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>👤 Traité par</Text>
                <Text style={detailValue}>{validatedBy}</Text>
              </Section>
            </Section>

            {/* Rejection Reason */}
            <Section style={reasonBox}>
              <Text style={reasonTitle}>📝 Raison du refus</Text>
              <Text style={reasonText}>{rejectionReason}</Text>
            </Section>

            {/* Next Steps */}
            <Section style={infoBox}>
              <Text style={infoTitle}>💡 Que faire maintenant ?</Text>
              <ul style={list}>
                <li style={listItem}>
                  Consultez la raison du refus ci-dessus pour comprendre la décision
                </li>
                <li style={listItem}>
                  Vérifiez les disponibilités pour d'autres créneaux horaires
                </li>
                <li style={listItem}>
                  Vous pouvez faire une nouvelle demande en tenant compte des remarques
                </li>
                <li style={listItem}>
                  En cas de question, contactez directement la commission
                </li>
              </ul>
            </Section>

            <Section style={buttonContainer}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/reservations/new`} style={button}>
                Faire une nouvelle demande
              </Link>
            </Section>

            <Text style={textCenter}>
              N'hésitez pas à refaire une demande avec les ajustements nécessaires.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Besoin d'aide ? Contactez{" "}
              <Link href="mailto:support@esp.sn" style={link}>
                support@esp.sn
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} ESP Réservation. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#1e40af",
}

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
}

const tagline = {
  fontSize: "14px",
  color: "#93c5fd",
  margin: "8px 0 0 0",
}

const content = {
  padding: "0 48px",
}

const statusBadge = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const statusText = {
  display: "inline-block",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  padding: "8px 16px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
}

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "24px 0 16px",
  textAlign: "center" as const,
}

const text = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "16px 0",
}

const textCenter = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "16px 0",
  textAlign: "center" as const,
}

const rejectText = {
  color: "#dc2626",
}

const detailsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
}

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 16px 0",
}

const detailRow = {
  marginBottom: "16px",
}

const detailLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 4px 0",
  fontWeight: "500",
}

const detailValue = {
  fontSize: "16px",
  color: "#1e293b",
  margin: "0",
}

const reasonBox = {
  backgroundColor: "#fef2f2",
  borderLeft: "4px solid #ef4444",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
}

const reasonTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#991b1b",
  margin: "0 0 12px 0",
}

const reasonText = {
  fontSize: "15px",
  color: "#1e293b",
  lineHeight: "24px",
  margin: "0",
  fontStyle: "italic",
}

const infoBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
}

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e40af",
  margin: "0 0 12px 0",
}

const list = {
  margin: "0",
  padding: "0 0 0 20px",
}

const listItem = {
  fontSize: "14px",
  color: "#334155",
  lineHeight: "24px",
  margin: "4px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#1e40af",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
}

const footer = {
  padding: "0 48px",
  marginTop: "32px",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "32px",
}

const footerText = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "8px 0",
}

const link = {
  color: "#1e40af",
  textDecoration: "underline",
}
