import { PageHeader } from "@/components/page-header"
import { DashboardLoader } from "@/features/dashboard/dashboard-loader"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Dashboard - ESP Réservation Back Office",
  description: "Vue d'ensemble des réservations et statistiques",
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardLoader />
      </Suspense>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
