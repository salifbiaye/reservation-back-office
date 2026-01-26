import { getLocations } from "@/actions/locations"
import { LocationsContent } from "./locations-content"

export async function LocationsLoader({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const result = await getLocations({ searchParams })

  if ("error" in result) {
    return <div className="text-destructive">Erreur: {result.error}</div>
  }

  return <LocationsContent result={result} />
}
