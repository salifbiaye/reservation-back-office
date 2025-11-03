"use client"

import { useMemo } from "react"
import { format, isSameDay, isSameMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { getCalendarCells, getEventsForDay } from "@/lib/calendar-helpers"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-media-query"

const WEEK_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const WEEK_DAYS_MOBILE = ["D", "L", "M", "M", "J", "V", "S"]

const statusConfig = {
  PENDING: { label: "En attente", variant: "secondary" as const },
  ACCEPTED: { label: "Acceptée", variant: "default" as const },
  REJECTED: { label: "Refusée", variant: "destructive" as const },
  CANCELLED: { label: "Annulée", variant: "outline" as const },
}

export function MonthView() {
  const { selectedDate, selectedLocationId, reservations, openReservationDetails } = useCalendar()
  const isMobile = useIsMobile()

  // Filtrer par le lieu sélectionné uniquement
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.location.id === selectedLocationId)
  }, [reservations, selectedLocationId])

  // En mobile : afficher uniquement la semaine courante
  // En desktop : afficher le mois complet
  const cells = useMemo(() => {
    if (isMobile) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 })
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
      const today = new Date()

      return days.map((day) => ({
        date: day,
        isCurrentMonth: isSameMonth(day, selectedDate),
        isToday: isSameDay(day, today),
      }))
    }
    return getCalendarCells(selectedDate)
  }, [selectedDate, isMobile])

  const weekDays = isMobile ? WEEK_DAYS_MOBILE : WEEK_DAYS

  return (
    <div className="flex-1">
      {/* Header avec jours de la semaine */}
      <div className="grid grid-cols-7 divide-x border-b">
        {weekDays.map((day, idx) => (
          <div key={idx} className="flex items-center justify-center py-2 md:py-3">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className={cn(
        "grid grid-cols-7 divide-x divide-y",
        isMobile ? "auto-rows-[150px]" : "auto-rows-fr"
      )}>
        {cells.map((cell) => {
          const dayEvents = getEventsForDay(filteredReservations, cell.date)
          const displayEvents = isMobile ? dayEvents.slice(0, 2) : dayEvents.slice(0, 3)
          const remaining = dayEvents.length - (isMobile ? 2 : 3)

          return (
            <div
              key={cell.date.toISOString()}
              className={cn(
                "min-h-[80px] md:min-h-[120px] p-1 md:p-2 hover:bg-muted/50 transition-colors",
                !cell.isCurrentMonth && "bg-muted/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    cell.isToday && "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground",
                    !cell.isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(cell.date, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {displayEvents.map((event) => {
                  const status = statusConfig[event.status as keyof typeof statusConfig]
                  return (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: `${event.location.commission.color}20`,
                        borderLeft: `3px solid ${event.location.commission.color}`,
                      }}
                      title={`${event.title} - ${event.location.name}`}
                      onClick={() => openReservationDetails(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-muted-foreground truncate">
                        {format(new Date(event.start), "HH:mm")}
                      </div>
                    </div>
                  )
                })}

                {remaining > 0 && (
                  <div className="text-xs text-muted-foreground pl-1">
                    +{remaining} autre{remaining > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
