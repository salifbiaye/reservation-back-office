import { PageHeader } from "@/components/page-header"
import { UsersLoader } from "@/features/users/users-loader"
import { PageHeroSection } from "@/components/page-hero"
import { Users2 } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Utilisateurs - ESP Réservation Back Office",
  description: "Gestion des utilisateurs",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={Users2}
          title="Utilisateurs"
          description="Gérez les rôles et permissions des utilisateurs"
          visualIcon={Users2}
        />

        <Suspense fallback={<TableSkeleton />}>
          <UsersLoader searchParams={params} />
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
