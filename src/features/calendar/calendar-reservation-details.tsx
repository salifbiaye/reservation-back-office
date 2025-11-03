"use client"

import { Modal } from "@/components/modal"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, MapPin, User, FileText } from "lucide-react"

interface Reservation {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  status: string
  location: {
    id: string
    name: string
    commission: {
      name: string
      color: string
    }
  }
  user: {
    name: string
    email: string
  }
}

interface CalendarReservationDetailsProps {
  reservation: Reservation | null
  isOpen: boolean
  onClose: () => void
}

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function CalendarReservationDetails({
  reservation,
  isOpen,
  onClose,
}: CalendarReservationDetailsProps) {
  if (!reservation) return null

  const status = statusConfig[reservation.status as keyof typeof statusConfig]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la réservation"
      size="md"
    >
      <div className="space-y-6">
        {/* Titre et statut */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {reservation.title}
            </h3>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <Separator />

        {/* Informations principales */}
        <div className="space-y-4">
          {/* Date et heure */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Date et heure</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(reservation.start), "PPPP", { locale: fr })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  De {format(new Date(reservation.start), "HH:mm")} à {format(new Date(reservation.end), "HH:mm")}
                </p>
              </div>
            </div>
          </div>

          {/* Lieu */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Lieu</p>
              <p className="text-sm text-muted-foreground">{reservation.location.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: reservation.location.commission.color }}
                />
                <p className="text-xs text-muted-foreground">
                  {reservation.location.commission.name}
                </p>
              </div>
            </div>
          </div>

          {/* Étudiant */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Réservé par</p>
              <p className="text-sm text-muted-foreground">{reservation.user.name}</p>
              <p className="text-xs text-muted-foreground">{reservation.user.email}</p>
            </div>
          </div>

          {/* Description */}
          {reservation.description && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {reservation.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
