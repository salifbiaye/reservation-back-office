"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { deleteLocation } from "@/actions/locations"
import { toast } from "sonner"

interface Location {
  id: string
  name: string
  description: string | null
  maxDurationHours: number | null
  commission: {
    id: string
    name: string
    color: string
  }
  _count: {
    reservations: number
  }
}

interface LocationsTableProps {
  locations: Location[]
}

export function LocationsTable({ locations }: LocationsTableProps) {
  const handleDelete = async (location: Location) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${location.name}" ?`)) {
      return
    }

    const result = await deleteLocation(location.id)
    if (result.success) {
      toast.success("Lieu supprimé avec succès")
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
  }

  const columns: ColumnDef<Location>[] = [
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
      key: "maxDurationHours",
      label: "Limite (heures)",
      render: (value) => value ? `${value}h` : "-",
    },
    {
      key: "commission",
      label: "Commission",
      render: (_, item) => (
        <Badge
          variant="outline"
          style={{ borderColor: item.commission.color }}
        >
          {item.commission.name}
        </Badge>
      ),
    },
    {
      key: "reservations_count",
      label: "Réservations",
      render: (_, item) => item._count.reservations,
    },
  ]

  const actions: RowAction<Location>[] = [
    {
      label: "Modifier",
      onClick: (item) => window.location.href = `/locations/${item.id}/edit`,
    },
    {
      label: "Supprimer",
      onClick: handleDelete,
      variant: "destructive",
    },
  ]

  return (
    <DataTable
      data={locations}
      columns={columns}
      actions={actions}
      emptyState={
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun lieu trouvé</p>
        </div>
      }
    />
  )
}
