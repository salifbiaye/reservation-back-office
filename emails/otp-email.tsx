import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface OTPEmailProps {
  otp: string
  type: "sign-in" | "email-verification" | "forget-password"
  email: string
}

const titles = {
  "sign-in": "Code de connexion",
  "email-verification": "Vérification de votre email",
  "forget-password": "Réinitialisation de mot de passe"
}

const descriptions = {
  "sign-in": "Utilisez ce code pour vous connecter à votre compte ESP Réservation.",
  "email-verification": "Utilisez ce code pour vérifier votre adresse email et activer votre compte.",
  "forget-password": "Utilisez ce code pour réinitialiser votre mot de passe."
}

export default function OTPEmail({ otp, type, email }: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre code de vérification ESP Réservation: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>ESP Réservation</Heading>
            <Text style={tagline}>École Supérieure Polytechnique</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>{titles[type]}</Heading>

            <Text style={text}>
              Bonjour,
            </Text>

            <Text style={text}>
              {descriptions[type]}
            </Text>

            {/* OTP Code Box */}
            <Section style={otpBox}>
              <Text style={otpLabel}>Votre code de vérification :</Text>
              <Text style={otpCode}>{otp}</Text>
            </Section>

            {/* Info Box */}
            <Section style={infoBox}>
              <Text style={infoText}>
                ⏱️ Ce code expire dans <strong>10 minutes</strong>
              </Text>
              <Text style={infoText}>
                📧 Demandé pour: <strong>{email}</strong>
              </Text>
            </Section>

            <Text style={warningText}>
              Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
            </Text>

            {/* Security tip */}
            <Section style={securityBox}>
              <Text style={securityTitle}>🔒 Conseil de sécurité</Text>
              <Text style={securityText}>
                Ne partagez jamais ce code avec qui que ce soit. L'équipe ESP ne vous demandera jamais votre code de vérification.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Contactez-nous à support@esp.sn
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

const otpBox = {
  backgroundColor: "#ffffff",
  border: "3px solid #3b82f6",
  borderRadius: "16px",
  padding: "32px",
  margin: "32px 0",
  textAlign: "center" as const,
}

const otpLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 16px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  fontWeight: "600",
}

const otpCode = {
  fontSize: "48px",
  fontWeight: "bold",
  color: "#1e40af",
  margin: "0",
  letterSpacing: "12px",
  fontFamily: "monospace",
}

const infoBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
}

const infoText = {
  fontSize: "14px",
  color: "#1e293b",
  margin: "8px 0",
  lineHeight: "22px",
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
