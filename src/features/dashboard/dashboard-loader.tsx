import { getDashboardStats, getTimeSeriesData } from "@/actions/dashboard"
import { AdminDashboard } from "./admin-dashboard"
import { CEEDashboard } from "./cee-dashboard"

export async function DashboardLoader() {
  const result = await getDashboardStats()

  if ("error" in result) {
    return <div className="text-destructive">Erreur: {result.error}</div>
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

  return result.type === "ADMIN" ? (
    <AdminDashboard data={result.data} timeSeriesData={timeSeriesData} />
  ) : (
    <CEEDashboard data={result.data} />
  )
}
