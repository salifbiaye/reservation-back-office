"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { getCalendarCells, calculateMonthEventPositions, type EventWithPosition } from "@/lib/calendar-helpers"
import { cn } from "@/lib/utils"

const WEEK_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

export function MonthView() {
  const { selectedDate, selectedLocationId, reservations, openReservationDetails } = useCalendar()

  // Filtrer par le lieu sélectionné uniquement
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.location.id === selectedLocationId)
  }, [reservations, selectedLocationId])

  // Obtenir les cellules du calendrier
  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate])

  // Calculer les positions des événements multi-jours
  const eventPositions = useMemo(() => {
    return calculateMonthEventPositions(filteredReservations, selectedDate)
  }, [filteredReservations, selectedDate])

  // Diviser les cellules en semaines
  const weeks = useMemo(() => {
    const result: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7))
    }
    return result
  }, [cells])

  // Grouper les événements par semaine
  const eventsByWeek = useMemo(() => {
    const map = new Map<number, EventWithPosition[]>()
    eventPositions.forEach((pos) => {
      const existing = map.get(pos.weekIndex) || []
      existing.push(pos)
      map.set(pos.weekIndex, existing)
    })
    return map
  }, [eventPositions])

  // Calculer le nombre maximal de rows par semaine
  const maxRowsByWeek = useMemo(() => {
    const map = new Map<number, number>()
    eventsByWeek.forEach((events, weekIndex) => {
      const maxRow = Math.max(0, ...events.map((e) => e.row))
      map.set(weekIndex, maxRow + 1)
    })
    return map
  }, [eventsByWeek])

  return (
    <div className="flex-1 flex flex-col">
      {/* Header avec jours de la semaine */}
      <div className="grid grid-cols-7 divide-x border-b">
        {WEEK_DAYS.map((day, idx) => (
          <div key={idx} className="flex items-center justify-center py-3">
            <span className="text-sm font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      {/* Grille des semaines */}
      <div className="flex-1 flex flex-col divide-y">
        {weeks.map((week, weekIndex) => {
          const weekEvents = eventsByWeek.get(weekIndex) || []
          const numRows = maxRowsByWeek.get(weekIndex) || 0
          const minHeight = 100 + numRows * 32 // hauteur de base + espace pour les événements

          return (
            <div key={weekIndex} className="relative flex-1" style={{ minHeight: `${minHeight}px` }}>
              {/* Grille de fond pour les jours */}
              <div className="absolute inset-0 grid grid-cols-7 divide-x">
                {week.map((cell) => (
                  <div
                    key={cell.date.toISOString()}
                    className={cn(
                      "p-2 hover:bg-muted/50 transition-colors",
                      !cell.isCurrentMonth && "bg-muted/20"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center justify-center text-sm font-medium",
                        cell.isToday && "h-7 w-7 rounded-full bg-primary text-primary-foreground",
                        !cell.isCurrentMonth && "text-muted-foreground"
                      )}
                    >
                      {format(cell.date, "d")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Événements positionnés avec grid */}
              <div className="absolute inset-0 pointer-events-none" style={{ paddingTop: "36px" }}>
                <div className="relative h-full">
                  {weekEvents.map((pos, idx) => {
                    const { event, startCol, span, row } = pos

                    return (
                      <div
                        key={`${event.id}-${weekIndex}`}
                        className="absolute pointer-events-auto cursor-pointer"
                        style={{
                          left: `${(startCol / 7) * 100}%`,
                          width: `${(span / 7) * 100}%`,
                          top: `${row * 32}px`,
                          height: "28px",
                          padding: "0 4px",
                        }}
                        onClick={() => openReservationDetails(event)}
                      >
                        <div
                          className="h-full rounded px-2 flex items-center text-xs font-medium truncate hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${event.location.commission.color}20`,
                            borderLeft: `3px solid ${event.location.commission.color}`,
                          }}
                          title={`${event.title} - ${event.location.name}\n${format(new Date(event.start), "d MMM HH:mm", { locale: fr })} - ${format(new Date(event.end), "d MMM HH:mm", { locale: fr })}`}
                        >
                          <span className="truncate">
                            {startCol === 0 && (
                              <span className="mr-1">
                                {format(new Date(event.start), "HH:mm")}
                              </span>
                            )}
                            {event.title}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
