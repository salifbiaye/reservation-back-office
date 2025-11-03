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
} from "@react-email/components"

interface WelcomeUserEmailProps {
  name: string
  email: string
  password: string
  role: string
}

const roleLabels = {
  ADMIN: "Administrateur",
  CEE: "Membre de Commission",
  STUDENT: "Étudiant"
}

export default function WelcomeUserEmail({ name, email, password, role }: WelcomeUserEmailProps) {
  const roleLabel = roleLabels[role as keyof typeof roleLabels] || role

  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur ESP Réservation - Vos identifiants de connexion</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>ESP Réservation</Heading>
            <Text style={tagline}>École Supérieure Polytechnique</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>🎉 Bienvenue {name}!</Heading>

            <Text style={text}>
              Votre compte a été créé avec succès sur la plateforme ESP Réservation Back Office.
            </Text>

            <Text style={text}>
              En tant que <strong>{roleLabel}</strong>, vous avez accès à la gestion des réservations.
            </Text>

            {/* Credentials Box */}
            <Section style={credentialsBox}>
              <Text style={credentialsTitle}>🔑 Vos identifiants de connexion</Text>

              <Section style={credentialItem}>
                <Text style={credentialLabel}>Email</Text>
                <Text style={credentialValue}>{email}</Text>
              </Section>

              <Section style={credentialItem}>
                <Text style={credentialLabel}>Mot de passe temporaire</Text>
                <Text style={credentialPassword}>{password}</Text>
              </Section>
            </Section>

            {/* Action Button */}
            <Section style={buttonContainer}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login`} style={button}>
                Se connecter maintenant
              </Link>
            </Section>

            {/* Info Box */}
            <Section style={infoBox}>
              <Text style={infoTitle}>📌 Prochaines étapes</Text>
              <Text style={infoText}>
                1️⃣ Connectez-vous avec vos identifiants<br />
                2️⃣ Changez votre mot de passe dans "Mon Profil"<br />
                3️⃣ Explorez les fonctionnalités disponibles
              </Text>
            </Section>

            {/* Security tip */}
            <Section style={securityBox}>
              <Text style={securityTitle}>🔒 Conseil de sécurité</Text>
              <Text style={securityText}>
                Pour votre sécurité, nous vous recommandons de changer ce mot de passe temporaire dès votre première connexion.
                Ne partagez jamais vos identifiants avec qui que ce soit.
              </Text>
            </Section>

            <Text style={warningText}>
              Vous pouvez également vous connecter avec votre compte Google si votre email correspond.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Contactez l'équipe administrative
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

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "40px 0 20px",
  textAlign: "center" as const,
}

const text = {
  fontSize: "16px",
  color: "#334155",
  lineHeight: "26px",
  margin: "16px 0",
}

const credentialsBox = {
  backgroundColor: "#f8fafc",
  border: "2px solid #3b82f6",
  borderRadius: "12px",
  padding: "24px",
  margin: "32px 0",
}

const credentialsTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e40af",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
}

const credentialItem = {
  margin: "16px 0",
}

const credentialLabel = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  fontWeight: "600",
}

const credentialValue = {
  fontSize: "16px",
  color: "#1e293b",
  margin: "0",
  fontWeight: "500",
}

const credentialPassword = {
  fontSize: "20px",
  color: "#1e40af",
  margin: "0",
  fontWeight: "bold",
  fontFamily: "monospace",
  letterSpacing: "1px",
  backgroundColor: "#eff6ff",
  padding: "8px 12px",
  borderRadius: "6px",
  display: "inline-block",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "16px",
  display: "inline-block",
}

const infoBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
}

const infoTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e40af",
  margin: "0 0 12px 0",
}

const infoText = {
  fontSize: "14px",
  color: "#1e293b",
  margin: "0",
  lineHeight: "24px",
}

const warningText = {
  fontSize: "14px",
  color: "#64748b",
  textAlign: "center" as const,
  margin: "24px 0",
  fontStyle: "italic",
}

const securityBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #eab308",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
}

const securityTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#854d0e",
  margin: "0 0 8px 0",
}

const securityText = {
  fontSize: "13px",
  color: "#713f12",
  margin: "0",
  lineHeight: "20px",
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
