"use client"

import {Fragment, useMemo} from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { getEventsForDay } from "@/lib/calendar-helpers"
import { useIsMobile } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 80 // hauteur d'une heure en pixels
const TIME_COLUMN_WIDTH = 80 // largeur de la colonne des heures

export function DayView() {
  const { selectedDate, selectedLocationId, reservations, openReservationDetails } = useCalendar()
  const isMobile = useIsMobile()

  // Filtrer par le lieu sélectionné uniquement
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.location.id === selectedLocationId)
  }, [reservations, selectedLocationId])

  const dayEvents = useMemo(
    () => getEventsForDay(filteredReservations, selectedDate),
    [filteredReservations, selectedDate]
  )

  // Préparer les événements avec leur position et durée
  const eventsWithPosition = useMemo(() => {
    return dayEvents.map((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      const startHour = eventStart.getHours() + eventStart.getMinutes() / 60
      const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60

      const durationHours = endHour - startHour
      const top = startHour * HOUR_HEIGHT
      const height = Math.max(durationHours * HOUR_HEIGHT, 30) // minimum 30px

      return {
        ...event,
        top,
        height,
        startHour: Math.floor(startHour),
      }
    })
  }, [dayEvents])

  return (
    <div className="flex-1 overflow-auto">
      <div className={cn(isMobile ? "min-w-[350px]" : "min-w-[600px]")}>
        {/* Header */}
        <div className={cn(
          "sticky top-0 z-20 bg-background border-b text-center",
          isMobile ? "p-3" : "p-4"
        )}>
          <div className={cn(
            "text-muted-foreground uppercase",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {format(selectedDate, "EEEE", { locale: fr })}
          </div>
          <div className={cn(
            "font-bold mt-1",
            isMobile ? "text-xl" : "text-3xl"
          )}>
            {format(selectedDate, "d MMMM yyyy", { locale: fr })}
          </div>
        </div>

        {/* Grille des heures avec événements positionnés absolument */}
        <div className="relative">
          <div className={cn(
            "grid",
            isMobile ? "grid-cols-[60px_1fr]" : "grid-cols-[80px_1fr]"
          )}>
            {HOURS.map((hour) => (
              <Fragment key={hour}>
                {/* Colonne des heures */}
                <div
                  key={`hour-${hour}`}
                  className={cn(
                    "border-b border-r text-muted-foreground text-right",
                    isMobile ? "p-2 text-xs" : "p-3 text-sm"
                  )}
                  style={{ height: HOUR_HEIGHT }}
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {/* Colonne du contenu (vide, juste pour la grille) */}
                <div
                  key={`content-${hour}`}
                  className="border-b border-l"
                  style={{ height: HOUR_HEIGHT }}
                />
              </Fragment>
            ))}
          </div>

          {/* Événements positionnés absolument par-dessus la grille */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: isMobile ? '60px' : '80px',
              right: 0,
              top: 0,
              height: HOUR_HEIGHT * 24,
            }}
          >
            {eventsWithPosition.map((event) => (
              <div
                key={event.id}
                className="absolute left-0 right-0 mx-2 pointer-events-auto cursor-pointer"
                style={{
                  top: `${event.top}px`,
                  height: `${event.height}px`,
                }}
                onClick={() => openReservationDetails(event)}
              >
                <div
                  className={cn(
                    "h-full rounded hover:opacity-80 transition-opacity overflow-hidden",
                    isMobile ? "text-xs p-2" : "text-sm p-3"
                  )}
                  style={{
                    backgroundColor: `${event.location.commission.color}20`,
                    borderLeft: `4px solid ${event.location.commission.color}`,
                  }}
                  title={`${event.title} - ${event.location.name}\n${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}`}
                >
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className={cn(
                    "text-muted-foreground mt-1",
                    isMobile ? "text-[10px]" : "text-xs"
                  )}>
                    {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                  </div>
                  <div className={cn(
                    "mt-1 flex items-center gap-1",
                    isMobile ? "text-[10px]" : "text-xs"
                  )}>
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.location.commission.color }}
                    />
                    <span className="truncate">{event.location.name}</span>
                  </div>
                  {!isMobile && event.height > 60 && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {event.user.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
