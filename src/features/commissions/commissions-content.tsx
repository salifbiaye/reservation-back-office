"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { DataSearch } from "@/components/data-search"
import { DataFilter } from "@/components/data-filter"
import { DataPagination } from "@/components/data-pagination"
import { CreateCommissionModal, EditCommissionModal, DeleteCommissionModal } from "./commissions-modals"

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

interface CommissionsContentProps {
  result: {
    data: Commission[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export function CommissionsContent({ result }: CommissionsContentProps) {
  const router = useRouter()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleEdit = (commission: Commission) => {
    setSelectedCommission(commission)
    setEditModalOpen(true)
  }

  const handleDelete = (commission: Commission) => {
    setSelectedCommission(commission)
    setDeleteModalOpen(true)
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
          Nouvelle commission
        </Button>
      </div>

      <DataTable
        data={result.data}
        columns={columns}
        actions={actions}
        headerContent={
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <DataSearch placeholder="Rechercher une commission..." />
            </div>
            <DataFilter />
          </div>
        }
        footerContent={
          <DataPagination totalItems={result.pagination.total} />
        }
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune commission trouvée</p>
          </div>
        }
      />

      {/* Modals */}
      <CreateCommissionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {selectedCommission && (
        <>
          <EditCommissionModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleRefresh}
            commission={selectedCommission}
          />

          <DeleteCommissionModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onSuccess={handleRefresh}
            commission={selectedCommission}
          />
        </>
      )}
    </div>
  )
}
