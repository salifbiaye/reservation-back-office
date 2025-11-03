"use client"

import { useMemo } from "react"
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { getEventsForDay } from "@/lib/calendar-helpers"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function AgendaView() {
  const { selectedDate, selectedLocationId, reservations, openReservationDetails } = useCalendar()

  // Filtrer par le lieu sélectionné uniquement
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.location.id === selectedLocationId)
  }, [reservations, selectedLocationId])

  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const daysWithEvents = useMemo(() => {
    return days
      .map((day) => {
        const events = getEventsForDay(filteredReservations, day)
        return { day, events }
      })
      .filter((item) => item.events.length > 0)
  }, [days, filteredReservations])

  if (daysWithEvents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Aucune réservation pour ce mois
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {daysWithEvents.map(({ day, events }) => (
          <div key={day.toISOString()}>
            <div className="sticky top-0 z-10 bg-background py-3 border-b mb-4">
              <h3 className="text-lg font-semibold capitalize">
                {format(day, "EEEE d MMMM yyyy", { locale: fr })}
              </h3>
            </div>

            <div className="space-y-3">
              {events.map((event) => {
                const status = statusConfig[event.status as keyof typeof statusConfig]
                return (
                  <Card
                    key={event.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    style={{
                      borderLeft: `4px solid ${event.location.commission.color}`,
                    }}
                    onClick={() => openReservationDetails(event)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Heure:</span>
                            <span className="font-medium">
                              {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Lieu:</span>
                            <div className="flex items-center gap-1">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: event.location.commission.color }}
                              />
                              <span className="font-medium">{event.location.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Commission:</span>
                            <span className="font-medium">{event.location.commission.name}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Demandé par:</span>{" "}
                          <span className="font-medium">{event.user.name}</span>{" "}
                          <span className="text-muted-foreground">({event.user.email})</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
