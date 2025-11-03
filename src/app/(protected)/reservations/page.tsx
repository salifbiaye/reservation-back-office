import { PageHeader } from "@/components/page-header"
import { getReservations } from "@/actions/reservations"
import { ReservationsContent } from "@/features/reservations/reservations-content"
import {PageHeroSection} from "@/components/page-hero";
import {CalendarCheck, Clock, User} from "lucide-react";

export const metadata = {
  title: "Réservations - ESP Réservation Back Office",
  description: "Gestion des réservations",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await getReservations({ searchParams: params })

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
            icon={CalendarCheck}
            title="Réservations"
            description=" Gérez et validez les demandes de réservation"

            visualIcon={CalendarCheck}
        />
        <ReservationsContent result={result}/>
      </div>
    </>
  )
}
