"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye } from "lucide-react"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { ReservationDetailsDialog } from "./reservation-details-dialog"
import { acceptReservation, rejectReservation, deleteReservation } from "@/actions/reservations"
import { toast } from "sonner"

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

interface ReservationsTableProps {
  reservations: Reservation[]
  userRole: string
  userId: string
}

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function ReservationsTable({ reservations, userRole, userId }: ReservationsTableProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const handleAccept = async (reservation: Reservation) => {
    const result = await acceptReservation(reservation.id, userId)

    if (result.success) {
      toast.success("Réservation acceptée avec succès")
    } else {
      toast.error(result.error || "Erreur lors de l'acceptation")
    }
  }

  const handleReject = async (reservation: Reservation) => {
    const reason = prompt("Raison du refus :")
    if (!reason) return

    const result = await rejectReservation(reservation.id, userId, reason)

    if (result.success) {
      toast.success("Réservation refusée")
    } else {
      toast.error(result.error || "Erreur lors du refus")
    }
  }

  const handleDelete = async (reservation: Reservation) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer la réservation "${reservation.title}" ?\n\nCette action est irréversible.`
    )

    if (!confirmed) return

    const result = await deleteReservation(reservation.id)

    if (result.success) {
      toast.success("Réservation supprimée avec succès")
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
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
      show: () => userRole === "ADMIN", // Visible uniquement pour les ADMIN
    },
  ]

  return (
    <>
      <DataTable
        data={reservations}
        columns={columns}
        actions={actions}
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune réservation trouvée</p>
          </div>
        }
      />

      {selectedReservation && (
        <ReservationDetailsDialog
          reservation={selectedReservation}
          open={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  )
}
