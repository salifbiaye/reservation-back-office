import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface NewReservationNotificationEmailProps {
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

export default function NewReservationNotificationEmail({
  ceeMemberName,
  studentName,
  studentEmail,
  title,
  description,
  locationName,
  commissionName,
  start,
  end
}: NewReservationNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle demande de réservation - ESP Réservation</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>ESP Réservation</Heading>
            <Text style={tagline}>École Supérieure Polytechnique</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <div style={notificationBox}>
              <Text style={notificationIcon}>🔔</Text>
              <Heading style={h1}>Nouvelle demande de réservation</Heading>
            </div>

            <Text style={text}>
              Bonjour {ceeMemberName},
            </Text>

            <Text style={text}>
              Une nouvelle demande de réservation nécessite votre attention pour l'un des lieux gérés par votre commission <strong>{commissionName}</strong>.
            </Text>

            {/* Student Info Box */}
            <Section style={studentBox}>
              <Text style={studentTitle}>👤 Demandeur</Text>
              <Section style={detailItem}>
                <Text style={detailLabel}>Nom</Text>
                <Text style={detailValue}>{studentName}</Text>
              </Section>
              <Section style={detailItem}>
                <Text style={detailLabel}>Email</Text>
                <Text style={detailValue}>{studentEmail}</Text>
              </Section>
            </Section>

            {/* Reservation Details Box */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>📅 Détails de la demande</Text>

              <Section style={detailItem}>
                <Text style={detailLabel}>Titre</Text>
                <Text style={detailValue}>{title}</Text>
              </Section>

              {description && (
                <Section style={detailItem}>
                  <Text style={detailLabel}>Description</Text>
                  <Text style={detailValue}>{description}</Text>
                </Section>
              )}

              <Section style={detailItem}>
                <Text style={detailLabel}>Lieu</Text>
                <Text style={detailValue}>{locationName}</Text>
              </Section>

              <Section style={detailItem}>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>
                  {format(new Date(start), "EEEE d MMMM yyyy", { locale: fr })}
                </Text>
              </Section>

              <Section style={detailItem}>
                <Text style={detailLabel}>Horaire</Text>
                <Text style={detailValue}>
                  {format(new Date(start), "HH:mm")} - {format(new Date(end), "HH:mm")}
                </Text>
              </Section>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonContainer}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reservations`} style={buttonPrimary}>
                Voir la demande
              </Link>
            </Section>

            <Text style={infoText}>
              💡 Veuillez traiter cette demande dans les plus brefs délais.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Vous recevez cet email car vous êtes membre de la commission {commissionName}
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
  maxWidth: "600px",
}

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#3b82f6",
}

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
}

const tagline = {
  fontSize: "14px",
  color: "#bfdbfe",
  margin: "8px 0 0 0",
}

const content = {
  padding: "0 48px",
}

const notificationBox = {
  textAlign: "center" as const,
  padding: "20px",
}

const notificationIcon = {
  fontSize: "48px",
  margin: "0",
}

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e40af",
  margin: "0",
}

const text = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "16px 0",
}

const studentBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
}

const studentTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#475569",
  margin: "0 0 12px 0",
}

const detailsBox = {
  backgroundColor: "#eff6ff",
  border: "2px solid #3b82f6",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
}

const detailsTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e40af",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
}

const detailItem = {
  margin: "12px 0",
}

const detailLabel = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  fontWeight: "600",
}

const detailValue = {
  fontSize: "16px",
  color: "#1e293b",
  margin: "0",
  fontWeight: "500",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
  display: "flex",
  gap: "12px",
  justifyContent: "center",
}

const buttonPrimary = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "16px",
  display: "inline-block",
}

const infoText = {
  fontSize: "14px",
  color: "#64748b",
  textAlign: "center" as const,
  margin: "24px 0",
  fontStyle: "italic",
}

const divider = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
}

const footer = {
  padding: "0 48px",
  marginTop: "32px",
}

const footerText = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "8px 0",
}
