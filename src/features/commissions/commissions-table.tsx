"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { deleteCommission } from "@/actions/commissions"
import { toast } from "sonner"

interface Commission {
  id: string
  name: string
  description: string | null
  color: string
  _count: {
    members: number
    locations: number
  }
}

interface CommissionsTableProps {
  commissions: Commission[]
}

export function CommissionsTable({ commissions }: CommissionsTableProps) {
  const handleDelete = async (commission: Commission) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${commission.name}" ?`)) {
      return
    }

    const result = await deleteCommission(commission.id)
    if (result.success) {
      toast.success("Commission supprimée avec succès")
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
  }

  const columns: ColumnDef<Commission>[] = [
    {
      key: "name",
      label: "Nom",
      className: "font-medium",
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="max-w-xs truncate block">{value || "-"}</span>
      ),
    },
    {
      key: "color",
      label: "Couleur",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-muted-foreground">{value}</span>
        </div>
      ),
    },
    {
      key: "members_count",
      label: "Membres",
      render: (_, item) => item._count.members,
    },
    {
      key: "locations_count",
      label: "Lieux",
      render: (_, item) => item._count.locations,
    },
  ]

  const actions: RowAction<Commission>[] = [
    {
      label: "Modifier",
      onClick: (item) => window.location.href = `/commissions/${item.id}/edit`,
    },
    {
      label: "Supprimer",
      onClick: handleDelete,
      variant: "destructive",
    },
  ]

  return (
    <DataTable
      data={commissions}
      columns={columns}
      actions={actions}
      emptyState={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune commission trouvée</p>
        </div>
      }
    />
  )
}
