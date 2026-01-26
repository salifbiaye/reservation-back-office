import { getCalendarData } from "@/actions/calendar"
import { CalendarProvider } from "./calendar-context"

export async function CalendarDataLoader({ children }: { children: React.ReactNode }) {
  const result = await getCalendarData()

  if ("error" in result) {
    return <div className="text-destructive">Erreur: {result.error}</div>
  }

  return (
    <CalendarProvider
      locations={result.locations}
      reservations={result.reservations}
    >
      {children}
    </CalendarProvider>
  )
}
