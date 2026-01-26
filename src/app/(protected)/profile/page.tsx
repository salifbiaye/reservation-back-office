import { PageHeader } from "@/components/page-header"
import { PageHeroSection } from "@/components/page-hero"
import { User } from "lucide-react"
import { ProfileLoader } from "@/features/profile/profile-loader"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Mon Profil - ESP Réservation Back Office",
  description: "Gérer vos informations personnelles et votre compte",
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
          icon={User}
          title="Mon Profil"
          description="Gérez vos informations personnelles et la sécurité de votre compte"
          visualIcon={User}
        />

        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileLoader />
        </Suspense>
      </div>
    </>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
