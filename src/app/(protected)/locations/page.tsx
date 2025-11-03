import { PageHeader } from "@/components/page-header"
import { getLocations } from "@/actions/locations"
import { LocationsContent } from "@/features/locations/locations-content"
import {PageHeroSection} from "@/components/page-hero";
import {Locate, MapPin} from "lucide-react";

export const metadata = {
  title: "Lieux - ESP Réservation Back Office",
  description: "Gestion des lieux de réservation",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LocationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await getLocations({ searchParams: params })

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

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
      <LocationsContent result={result} />
      </div>
    </>
  )
}
