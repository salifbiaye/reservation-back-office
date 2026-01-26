import { PageHeader } from "@/components/page-header"
import { LocationsLoader } from "@/features/locations/locations-loader"
import { PageHeroSection } from "@/components/page-hero"
import { MapPin } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Lieux - ESP Réservation ",
  description: "Gestion des lieux de réservation",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LocationsPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={MapPin}
          title="Lieux"
          description="Gérez les lieux disponibles pour les réservations"
          visualIcon={MapPin}
        />
        <Suspense fallback={<TableSkeleton />}>
          <LocationsLoader searchParams={params} />
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
