import { CalendarClientContainer } from "@/features/calendar/calendar-client-container"

export const metadata = {
  title: "Calendrier - Vue Année",
  description: "Vue annuelle du calendrier des réservations",
}

export default function CalendarYearPage() {
  return <CalendarClientContainer view="year" />
}
