"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { DataSearch } from "@/components/data-search"
import { DataFilter } from "@/components/data-filter"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { CreateLocationModal, EditLocationModal, DeleteLocationModal } from "./locations-modals"

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

interface LocationsContentProps {
  result: {
    data: Location[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export function LocationsContent({ result }: LocationsContentProps) {
  const router = useRouter()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleEdit = (location: Location) => {
    setSelectedLocation(location)
    setEditModalOpen(true)
  }

  const handleDelete = (location: Location) => {
    setSelectedLocation(location)
    setDeleteModalOpen(true)
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
      onClick: handleEdit,
      variant: "default",
    },
    {
      label: "Supprimer",
      onClick: handleDelete,
      variant: "destructive",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau lieu
        </Button>
      </div>

      <DataTable
        data={result.data}
        columns={columns}
        actions={actions}
        headerContent={
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <DataSearch placeholder="Rechercher un lieu..." />
            </div>
            <DataFilter />
          </div>
        }
        footerContent={
          <DataPagination totalItems={result.pagination.total} />
        }
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun lieu trouvé</p>
          </div>
        }
      />

      {/* Modals */}
      <CreateLocationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {selectedLocation && (
        <>
          <EditLocationModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleRefresh}
            location={selectedLocation}
          />

          <DeleteLocationModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onSuccess={handleRefresh}
            location={selectedLocation}
          />
        </>
      )}
    </div>
  )
}
