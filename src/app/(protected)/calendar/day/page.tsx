import { CalendarClientContainer } from "@/features/calendar/calendar-client-container"

export const metadata = {
  title: "Calendrier - Vue Jour",
  description: "Vue quotidienne du calendrier des réservations",
}

export default function CalendarDayPage() {
  return <CalendarClientContainer view="day" />
}
