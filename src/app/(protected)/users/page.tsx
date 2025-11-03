import { PageHeader } from "@/components/page-header"
import { getUsers } from "@/actions/users"
import { UsersContent } from "@/features/users/users-content"
import {PageHeroSection} from "@/components/page-hero";
import {Clock, Users2} from "lucide-react";

export const metadata = {
  title: "Utilisateurs - ESP Réservation Back Office",
  description: "Gestion des utilisateurs",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await getUsers({ searchParams: params })

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

  return (
    <>
      <PageHeader />
      <div className="flex-1 space-y-6 p-6">
        <PageHeroSection
            icon={Users2}
            title="Utilisateurs"
            description="Gérez les rôles et permissions des utilisateurs"

            visualIcon={Users2}
        />

        <UsersContent result={result}/>
      </div>
    </>
  )
}
