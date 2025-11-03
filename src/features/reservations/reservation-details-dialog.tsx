"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Reservation {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  status: string
  rejectionReason: string | null
  user: {
    name: string
    email: string
  }
  location: {
    name: string
    commission: {
      name: string
    }
  }
  createdAt: Date
}

interface ReservationDetailsDialogProps {
  reservation: Reservation
  open: boolean
  onClose: () => void
}

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function ReservationDetailsDialog({
  reservation,
  open,
  onClose,
}: ReservationDetailsDialogProps) {
  const status = statusConfig[reservation.status as keyof typeof statusConfig]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{reservation.title}</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            Détails complets de la réservation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Étudiant</p>
              <p className="text-sm">{reservation.user.name}</p>
              <p className="text-xs text-muted-foreground">{reservation.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lieu</p>
              <p className="text-sm">{reservation.location.name}</p>
              <p className="text-xs text-muted-foreground">
                {reservation.location.commission.name}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de début</p>
              <p className="text-sm">
                {format(new Date(reservation.start), "PPPP", { locale: fr })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(reservation.start), "HH:mm")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de fin</p>
              <p className="text-sm">
                {format(new Date(reservation.end), "PPPP", { locale: fr })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(reservation.end), "HH:mm")}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
            <p className="text-sm whitespace-pre-wrap">
              {reservation.description || "Aucune description fournie"}
            </p>
          </div>

          {reservation.rejectionReason && (
            <>
              <Separator />
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive mb-2">
                  Raison du refus
                </p>
                <p className="text-sm">{reservation.rejectionReason}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground">
            Créée le {format(new Date(reservation.createdAt), "PPP 'à' HH:mm", { locale: fr })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
