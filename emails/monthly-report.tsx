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

interface CommissionStat {
    name: string
    total: number
    accepted: number
    rejected: number
    pending: number
}

interface TopLocation {
    name: string
    count: number
}

interface MonthlyReportEmailProps {
    month: string
    year: number
    stats: {
        total: number
        pending: number
        accepted: number
        rejected: number
    }
    byCommission: CommissionStat[]
    topLocations: TopLocation[]
}

export default function MonthlyReportEmail({
                                               month,
                                               year,
                                               stats,
                                               byCommission,
                                               topLocations,
                                           }: MonthlyReportEmailProps) {
    const acceptanceRate = stats.total > 0
        ? Math.round((stats.accepted / stats.total) * 100)
        : 0

    return (
        <Html>
            <Head />
            <Preview>Rapport mensuel des réservations - {month} {year}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={heading}>📊 Rapport Mensuel</Heading>
                        <Text style={tagline}>ESP Réservation - {month} {year}</Text>
                    </Section>

                    {/* Content */}
                    <Section style={content}>
                        <Text style={greeting}>Bonjour,</Text>

                        <Text style={text}>
                            Voici le rapport mensuel des réservations pour le mois de <strong>{month} {year}</strong>.
                        </Text>

                        {/* Stats globales */}
                        <Section style={statsSection}>
                            <Heading style={sectionTitle}>📈 Statistiques Globales</Heading>

                            <Section style={statsGrid}>
                                <Section style={statCard}>
                                    <Text style={statNumber}>{stats.total}</Text>
                                    <Text style={statLabel}>Total réservations</Text>
                                </Section>

                                <Section style={statCardSuccess}>
                                    <Text style={statNumberSuccess}>{stats.accepted}</Text>
                                    <Text style={statLabel}>Acceptées</Text>
                                </Section>

                                <Section style={statCardWarning}>
                                    <Text style={statNumberWarning}>{stats.pending}</Text>
                                    <Text style={statLabel}>En attente</Text>
                                </Section>

                                <Section style={statCardDanger}>
                                    <Text style={statNumberDanger}>{stats.rejected}</Text>
                                    <Text style={statLabel}>Rejetées</Text>
                                </Section>
                            </Section>

                            <Section style={acceptanceBox}>
                                <Text style={acceptanceText}>
                                    📊 Taux d&apos;acceptation: <strong style={acceptanceRate >= 70 ? successColor : warningColor}>
                                    {acceptanceRate}%
                                </strong>
                                </Text>
                            </Section>
                        </Section>

                        {/* Par Commission */}
                        {byCommission.length > 0 && (
                            <Section style={commissionSection}>
                                <Heading style={sectionTitle}>🏛️ Répartition par Commission</Heading>

                                {byCommission.map((commission, index) => (
                                    <Section key={index} style={commissionCard}>
                                        <Text style={commissionName}>{commission.name}</Text>
                                        <Section style={commissionStats}>
                                            <Text style={commissionStatItem}>
                                                Total: <strong>{commission.total}</strong>
                                            </Text>
                                            <Text style={commissionStatItem}>
                                                Acceptées: <strong style={successColor}>{commission.accepted}</strong>
                                            </Text>
                                            <Text style={commissionStatItem}>
                                                En attente: <strong style={warningColor}>{commission.pending}</strong>
                                            </Text>
                                            <Text style={commissionStatItem}>
                                                Rejetées: <strong style={dangerColor}>{commission.rejected}</strong>
                                            </Text>
                                        </Section>
                                    </Section>
                                ))}
                            </Section>
                        )}

                        {/* Top 10 Lieux */}
                        {topLocations.length > 0 && (
                            <Section style={topLocationsSection}>
                                <Heading style={sectionTitle}>🏆 Top 10 Lieux les Plus Demandés</Heading>

                                <Section style={topLocationsList}>
                                    {topLocations.map((location, index) => (
                                        <Section key={index} style={topLocationItem}>
                                            <Text style={topLocationRank}>#{index + 1}</Text>
                                            <Text style={topLocationName}>{location.name}</Text>
                                            <Text style={topLocationCount}>{location.count} réservations</Text>
                                        </Section>
                                    ))}
                                </Section>
                            </Section>
                        )}

                        {/* Action Button */}
                        <Section style={buttonContainer}>
                            <Link
                                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard`}
                                style={button}
                            >
                                Voir le tableau de bord
                            </Link>
                        </Section>

                        {/* Info Box */}
                        <Section style={infoBox}>
                            <Text style={infoTitle}>💡 Informations</Text>
                            <Text style={infoText}>
                                Ce rapport est  envoyé à tous les administrateurs.
                                Les données incluent toutes les réservations créées durant le mois précédent.
                            </Text>
                        </Section>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            Des questions ? Contactez l&apos;équipe technique
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

const greeting = {
    fontSize: "16px",
    color: "#334155",
    margin: "32px 0 16px",
}

const text = {
    fontSize: "16px",
    color: "#334155",
    lineHeight: "26px",
    margin: "16px 0",
}

const sectionTitle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "32px 0 20px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "8px",
}

const statsSection = {
    margin: "24px 0",
}

const statsGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    margin: "20px 0",
}

const statCard = {
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center" as const,
}

const statCardSuccess = {
    ...statCard,
    backgroundColor: "#f0fdf4",
    border: "2px solid #22c55e",
}

const statCardWarning = {
    ...statCard,
    backgroundColor: "#fffbeb",
    border: "2px solid #eab308",
}

const statCardDanger = {
    ...statCard,
    backgroundColor: "#fef2f2",
    border: "2px solid #ef4444",
}

const statNumber = {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: "0 0 8px 0",
}

const statNumberSuccess = {
    ...statNumber,
    color: "#16a34a",
}

const statNumberWarning = {
    ...statNumber,
    color: "#ca8a04",
}

const statNumberDanger = {
    ...statNumber,
    color: "#dc2626",
}

const statLabel = {
    fontSize: "13px",
    color: "#64748b",
    margin: "0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontWeight: "600",
}

const acceptanceBox = {
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    padding: "16px",
    margin: "20px 0",
    textAlign: "center" as const,
}

const acceptanceText = {
    fontSize: "16px",
    color: "#1e293b",
    margin: "0",
}

const successColor = {
    color: "#16a34a",
}

const warningColor = {
    color: "#ca8a04",
}

const dangerColor = {
    color: "#dc2626",
}

const commissionSection = {
    margin: "32px 0",
}

const commissionCard = {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    margin: "12px 0",
}

const commissionName = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 12px 0",
}

const commissionStats = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
}

const commissionStatItem = {
    fontSize: "14px",
    color: "#334155",
    margin: "4px 0",
}

const topLocationsSection = {
    margin: "32px 0",
}

const topLocationsList = {
    margin: "16px 0",
}

const topLocationItem = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "12px 16px",
    margin: "8px 0",
    borderLeft: "4px solid #3b82f6",
}

const topLocationRank = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#3b82f6",
    margin: "0 12px 0 0",
    minWidth: "40px",
}

const topLocationName = {
    fontSize: "15px",
    color: "#1e293b",
    margin: "0",
    flex: "1",
    fontWeight: "500",
}

const topLocationCount = {
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
    fontWeight: "600",
}

const buttonContainer = {
    textAlign: "center" as const,
    margin: "40px 0",
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
    lineHeight: "22px",
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