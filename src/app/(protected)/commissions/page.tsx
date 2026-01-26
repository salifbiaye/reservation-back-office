import { PageHeader } from "@/components/page-header"
import { CommissionsLoader } from "@/features/commissions/commissions-loader"
import { PageHeroSection } from "@/components/page-hero"
import { Building2 } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Commissions - ESP Réservation Back Office",
  description: "Gestion des commissions",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CommissionsPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={Building2}
          title="Commissions"
          description="Gérez les commissions et leurs membres"
          visualIcon={Building2}
        />

        <Suspense fallback={<TableSkeleton />}>
          <CommissionsLoader searchParams={params} />
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
