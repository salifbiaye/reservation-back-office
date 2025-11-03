"use client"

import {Fragment, useMemo} from "react"
import { format, addDays, subDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { getWeekDays } from "@/lib/calendar-helpers"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-media-query"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60 // hauteur d'une heure en pixels
const TIME_COLUMN_WIDTH = 60 // largeur de la colonne des heures

export function WeekView() {
  const { selectedDate, selectedLocationId, reservations, openReservationDetails } = useCalendar()
  const isMobile = useIsMobile()

  // Filtrer par le lieu sélectionné uniquement
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.location.id === selectedLocationId)
  }, [reservations, selectedLocationId])

  // En mobile : afficher 3 jours (jour précédent, jour sélectionné, jour suivant)
  // En desktop : afficher la semaine complète (7 jours)
  const weekDays = useMemo(() => {
    if (isMobile) {
      return [
        subDays(selectedDate, 1),
        selectedDate,
        addDays(selectedDate, 1),
      ]
    }
    return getWeekDays(selectedDate)
  }, [selectedDate, isMobile])

  const numDays = weekDays.length

  // Préparer les événements avec leur position et durée pour chaque jour
  const eventsWithPosition = useMemo(() => {
    return weekDays.map((day, dayIndex) => {
      const dayEvents = filteredReservations.filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        const dayStart = new Date(day)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)

        return eventStart <= dayEnd && eventEnd >= dayStart
      })

      return dayEvents.map((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // Si l'événement commence avant ce jour, commencer à 00:00
        const startHour = isSameDay(eventStart, day)
          ? eventStart.getHours() + eventStart.getMinutes() / 60
          : 0

        // Si l'événement se termine après ce jour, terminer à 24:00
        const endHour = isSameDay(eventEnd, day)
          ? eventEnd.getHours() + eventEnd.getMinutes() / 60
          : 24

        const durationHours = endHour - startHour
        const top = startHour * HOUR_HEIGHT
        const height = Math.max(durationHours * HOUR_HEIGHT, 20) // minimum 20px

        return {
          ...event,
          top,
          height,
          dayIndex,
        }
      })
    })
  }, [weekDays, filteredReservations])

  const today = new Date()

  return (
    <div className="flex-1 overflow-auto">
      <div className="relative">
        <div className={cn(
          "grid min-w-[350px] md:min-w-[800px]",
          isMobile ? "grid-cols-[60px_repeat(3,1fr)]" : "grid-cols-[60px_repeat(7,1fr)]"
        )}>
          {/* Header avec les jours */}
          <div className="sticky top-0 z-10 bg-background border-b" />
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === today.toDateString()
            return (
              <div
                key={idx}
                className={cn(
                  "sticky top-0 z-10 bg-background border-b border-l p-3 text-center",
                  isToday && "bg-primary/5"
                )}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: fr })}
                </div>
                <div
                  className={cn(
                    "text-2xl font-semibold mt-1",
                    isToday && "flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            )
          })}

          {/* Grille des heures */}
          {HOURS.map((hour) => (
            <Fragment key={hour}>
              <div key={`hour-${hour}`} className="border-b border-r p-2 text-xs text-muted-foreground text-right pr-3" style={{ height: HOUR_HEIGHT }}>
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDays.map((day, dayIdx) => {
                const isToday = day.toDateString() === today.toDateString()

                return (
                  <div
                    key={`${hour}-${dayIdx}`}
                    className={cn(
                      "border-b border-l",
                      isToday && "bg-primary/5"
                    )}
                    style={{ height: HOUR_HEIGHT }}
                  />
                )
              })}
            </Fragment>
          ))}
        </div>

        {/* Événements positionnés absolument par-dessus la grille */}
        {eventsWithPosition.flat().map((event) => {
          const dayColumnWidth = `calc((100% - ${TIME_COLUMN_WIDTH}px) / ${numDays})`
          const leftPosition = `calc(${TIME_COLUMN_WIDTH}px + ${dayColumnWidth} * ${event.dayIndex})`

          return (
            <div
              key={`${event.id}-${event.dayIndex}`}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: leftPosition,
                width: dayColumnWidth,
                top: `${event.top + 80}px`, // 80px = hauteur du header
                height: `${event.height}px`,
                padding: '0 4px',
              }}
              onClick={() => openReservationDetails(event)}
            >
              <div
                className="h-full p-2 rounded text-xs hover:opacity-80 transition-opacity overflow-hidden"
                style={{
                  backgroundColor: `${event.location.commission.color}20`,
                  borderLeft: `3px solid ${event.location.commission.color}`,
                }}
                title={`${event.title} - ${event.location.name}\n${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}`}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-muted-foreground text-[10px]">
                  {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
