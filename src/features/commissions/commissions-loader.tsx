import { getCommissions } from "@/actions/commissions"
import { CommissionsContent } from "./commissions-content"

export async function CommissionsLoader({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const result = await getCommissions({ searchParams })

  if ("error" in result) {
    return <div className="text-destructive">Erreur: {result.error}</div>
  }

  return <CommissionsContent result={result} />
}
