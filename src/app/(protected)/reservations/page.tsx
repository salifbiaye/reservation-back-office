import { PageHeader } from "@/components/page-header"
import { ReservationsLoader } from "@/features/reservations/reservations-loader"
import { PageHeroSection } from "@/components/page-hero"
import { CalendarCheck } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Réservations - ESP Réservation Back Office",
  description: "Gestion des réservations",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={CalendarCheck}
          title="Réservations"
          description="Gérez et validez les demandes de réservation"
          visualIcon={CalendarCheck}
        />
        <Suspense fallback={<TableSkeleton />}>
          <ReservationsLoader searchParams={params} />
        </Suspense>
      </div>
    </>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
