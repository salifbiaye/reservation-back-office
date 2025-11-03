import { CalendarClientContainer } from "@/features/calendar/calendar-client-container"

export const metadata = {
  title: "Calendrier - Vue Semaine",
  description: "Vue hebdomadaire du calendrier des réservations",
}

export default function CalendarWeekPage() {
  return <CalendarClientContainer view="week" />
}
