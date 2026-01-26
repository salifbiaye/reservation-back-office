import { getReservations } from "@/actions/reservations"
import { ReservationsContent } from "./reservations-content"

export async function ReservationsLoader({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const result = await getReservations({ searchParams })

  if ("error" in result) {
    return <div className="text-destructive">Erreur: {result.error}</div>
  }

  return <ReservationsContent result={result} />
}
