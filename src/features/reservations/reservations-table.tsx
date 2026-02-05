"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import { DataTable, ColumnDef, RowAction } from "@/components/data-table"
import { ReservationDetailsDialog } from "./reservation-details-dialog"
import { acceptReservation, rejectReservation, deleteReservation, bulkDeleteReservations } from "@/actions/reservations"
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const isAdmin = userRole === "ADMIN"

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(reservations.map(r => r.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer ${selectedIds.size} réservation(s) ?\n\nCette action est irréversible.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    const result = await bulkDeleteReservations(Array.from(selectedIds))
    setIsDeleting(false)

    if (result.success) {
      toast.success(`${result.count} réservation(s) supprimée(s) avec succès`)
      setSelectedIds(new Set())
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
  }

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
    ...(isAdmin ? [{
      key: "select" as const,
      label: (
        <Checkbox
          checked={selectedIds.size === reservations.length && reservations.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Tout sélectionner"
        />
      ),
      render: (_: any, item: Reservation) => (
        <Checkbox
          checked={selectedIds.has(item.id)}
          onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
          aria-label={`Sélectionner ${item.title}`}
        />
      ),
      className: "w-12",
    }] : []),
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
    <>
      {isAdmin && selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} réservation(s) sélectionnée(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      )}

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
