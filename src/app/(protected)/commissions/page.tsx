import { PageHeader } from "@/components/page-header"
import { getCommissions } from "@/actions/commissions"
import { CommissionsContent } from "@/features/commissions/commissions-content"
import {PageHeroSection} from "@/components/page-hero";
import {Building2} from "lucide-react";

export const metadata = {
  title: "Commissions - ESP Réservation Back Office",
  description: "Gestion des commissions",
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CommissionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await getCommissions({ searchParams: params })

  if ("error" in result) {
    return <div>Erreur: {result.error}</div>
  }

  return (
      <>
        <PageHeader/>
          <div className="flex-1 space-y-6 p-6">
              <PageHeroSection
                  icon={Building2}
                  title="Commissions"
                  description=" Gérez les commissions et leurs membres"

                  visualIcon={Building2}
              />


          <CommissionsContent result={result}/>
          </div>
      </>
  )
}
