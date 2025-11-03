import { CalendarClientContainer } from "@/features/calendar/calendar-client-container"

export const metadata = {
  title: "Calendrier - Vue Agenda",
  description: "Vue agenda du calendrier des réservations",
}

export default function CalendarAgendaPage() {
  return <CalendarClientContainer view="agenda" />
}
