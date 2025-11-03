import { PageHeader } from "@/components/page-header"
import { getDashboardStats, getTimeSeriesData } from "@/actions/dashboard"
import { AdminDashboard } from "@/features/dashboard/admin-dashboard"
import { CEEDashboard } from "@/features/dashboard/cee-dashboard"

export const metadata = {
  title: "Dashboard - ESP Réservation Back Office",
  description: "Vue d'ensemble des réservations et statistiques",
}

export default async function DashboardPage() {
  const result = await getDashboardStats()

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

  // Fetch time series data for charts (only for admin)
  let timeSeriesData: Array<{
    date: string
    pending: number
    accepted: number
    rejected: number
    total: number
  }> = []

  if (result.type === "ADMIN") {
    const timeSeriesResult = await getTimeSeriesData()
    if (!("error" in timeSeriesResult)) {
      timeSeriesData = timeSeriesResult
    }
  }

  return (
    <>
      <PageHeader />


        {result.type === "ADMIN" ? (
            <AdminDashboard data={result.data} timeSeriesData={timeSeriesData}/>
        ) : (
            <CEEDashboard data={result.data}/>
        )}
    </>
  )
}
