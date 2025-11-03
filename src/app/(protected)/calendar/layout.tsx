import { PageHeader } from "@/components/page-header"
import { CalendarProvider } from "@/features/calendar/calendar-context"
import { getCalendarData } from "@/actions/calendar"
import { redirect } from "next/navigation"
import {PageHeroSection} from "@/components/page-hero";
import {Calendar} from "lucide-react";

export default async function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getCalendarData()

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
            icon={Calendar}
            title="Calendrier"
            description="Visualisez toutes les réservations dans le calendrier"

            visualIcon={Calendar}
        />


        <CalendarProvider
          locations={result.locations}
          reservations={result.reservations}
        >
          {children}
        </CalendarProvider>
      </div>
    </>
  )
}
