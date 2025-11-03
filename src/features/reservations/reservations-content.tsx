"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { DataSearch } from "@/components/data-search"
import { DataFilter } from "@/components/data-filter"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ReservationDetailsDialog } from "./reservation-details-dialog"
import {
  AcceptReservationModal,
  RejectReservationModal,
  CreateReservationModal,
  DeleteReservationModal
} from "./reservations-modals"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Reservation {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  status: string
  rejectionReason: string | null
  user: {
    id: string
    name: string
    email: string
  }
  location: {
    id: string
    name: string
    commission: {
      id: string
      name: string
    }
  }
  createdAt: Date
}

interface ReservationsContentProps {
  result: {
    data: Reservation[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function ReservationsContent({ result }: ReservationsContentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [reservationToAccept, setReservationToAccept] = useState<Reservation | null>(null)
  const [reservationToReject, setReservationToReject] = useState<Reservation | null>(null)
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null)

  const isAdmin = session?.user?.role === "ADMIN"

  const handleRefresh = () => {
    router.refresh()
  }

  const handleAccept = (reservation: Reservation) => {
    setReservationToAccept(reservation)
    setAcceptModalOpen(true)
  }

  const handleReject = (reservation: Reservation) => {
    setReservationToReject(reservation)
    setRejectModalOpen(true)
  }

  const handleDelete = (reservation: Reservation) => {
    setReservationToDelete(reservation)
    setDeleteModalOpen(true)
  }

  const columns: ColumnDef<Reservation>[] = [
    {
      key: "title",
      label: "Titre",
      className: "font-medium",
    },
    {
      key: "user",
      label: "Étudiant",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm">{item.user.name}</span>
          <span className="text-xs text-muted-foreground">{item.user.email}</span>
        </div>
      ),
    },
    {
      key: "location",
      label: "Lieu",
      render: (_, item) => item.location.name,
    },
    {
      key: "commission",
      label: "Commission",
      render: (_, item) => item.location.commission.name,
    },
    {
      key: "start",
      label: "Date & Heure",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(item.start), "PPP", { locale: fr })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(item.start), "HH:mm")} - {format(new Date(item.end), "HH:mm")}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (value) => {
        const status = statusConfig[value as keyof typeof statusConfig]
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  const actions: RowAction<Reservation>[] = [
    {
      label: "Voir détails",
      onClick: (item) => setSelectedReservation(item),
    },
    {
      label: "Accepter",
      onClick: handleAccept,
      show: (item) => item.status === "PENDING",
    },
    {
      label: "Refuser",
      onClick: handleReject,
      variant: "destructive",
      show: (item) => item.status === "PENDING",
    },
    {
      label: "Supprimer",
      onClick: handleDelete,
      variant: "destructive",
      show: () => isAdmin,
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">

        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer une réservation
        </Button>
      </div>

      <DataTable
        data={result.data}
        columns={columns}
        actions={actions}
        headerContent={
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <DataSearch placeholder="Rechercher une réservation..." />
            </div>
            <DataFilter
              extraFilters={[
                {
                  type: "select",
                  name: "status",
                  label: "Statut",
                  options: [
                    { label: "Tous", value: "" },
                    { label: "En attente", value: "PENDING" },
                    { label: "Acceptée", value: "ACCEPTED" },
                    { label: "Refusée", value: "REJECTED" },
                    { label: "Annulée", value: "CANCELLED" },
                  ],
                },
              ]}
              dateRangeEnabled
            />
          </div>
        }
        footerContent={
          <DataPagination totalItems={result.pagination.total} />
        }
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune réservation trouvée</p>
          </div>
        }
      />

      {/* Modals */}
      {selectedReservation && (
        <ReservationDetailsDialog
          reservation={selectedReservation}
          open={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {reservationToAccept && (
        <AcceptReservationModal
          isOpen={acceptModalOpen}
          onClose={() => setAcceptModalOpen(false)}
          onSuccess={handleRefresh}
          reservation={reservationToAccept}
          validatorId={session?.user?.id || ""}
        />
      )}

      {reservationToReject && (
        <RejectReservationModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onSuccess={handleRefresh}
          reservation={reservationToReject}
          validatorId={session?.user?.id || ""}
        />
      )}

      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {reservationToDelete && (
        <DeleteReservationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={handleRefresh}
          reservation={reservationToDelete}
        />
      )}
    </div>
  )
}
