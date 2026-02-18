import { redirect } from "next/navigation"

export default async function CalendarPage() {
  // Redirection par défaut vers la vue mois
  // La détection mobile se fait côté client si nécessaire
  redirect("/calendar/month")
}
