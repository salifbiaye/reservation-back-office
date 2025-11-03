import { CalendarClientContainer } from "@/features/calendar/calendar-client-container"

export const metadata = {
  title: "Calendrier - Vue Mois",
  description: "Vue mensuelle du calendrier des réservations",
}

export default function CalendarMonthPage() {
  return <CalendarClientContainer view="month" />
}
