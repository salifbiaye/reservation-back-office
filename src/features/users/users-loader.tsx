import { getUsers } from "@/actions/users"
import { UsersContent } from "./users-content"

export async function UsersLoader({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const result = await getUsers({ searchParams })

  if ("error" in result) {
    return <div className="text-destructive">Erreur: {result.error}</div>
  }

  return <UsersContent result={result} />
}
