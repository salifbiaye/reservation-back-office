"use client"

import { useMemo } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { getEventsForDay } from "@/lib/calendar-helpers"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-media-query"

const MONTHS = Array.from({ length: 12 }, (_, i) => i)
const WEEK_DAYS_SHORT = ["D", "L", "M", "M", "J", "V", "S"]

function MiniMonth({ monthIndex, year }: { monthIndex: number; year: number }) {
  const { selectedLocationId, reservations, selectedDate, setSelectedDate } = useCalendar()

  // Filtrer par le lieu sélectionné uniquement
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.location.id === selectedLocationId)
  }, [reservations, selectedLocationId])

  const monthDate = new Date(year, monthIndex, 1)
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const today = new Date()

  return (
    <div className="border rounded-lg p-3">
      <div className="text-center font-semibold text-sm mb-2">
        {format(monthDate, "MMMM", { locale: fr })}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_DAYS_SHORT.map((day, idx) => (
          <div key={idx} className="text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === monthIndex
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDate)
          const dayEvents = getEventsForDay(filteredReservations, day)
          const hasEvents = dayEvents.length > 0

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "aspect-square text-xs rounded hover:bg-muted transition-colors relative",
                !isCurrentMonth && "text-muted-foreground",
                isToday && "bg-primary text-primary-foreground font-bold",
                isSelected && !isToday && "bg-primary/20 font-semibold",
                hasEvents && isCurrentMonth && "font-medium"
              )}
            >
              {format(day, "d")}
              {hasEvents && isCurrentMonth && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: event.location.commission.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function YearView() {
  const { selectedDate } = useCalendar()
  const isMobile = useIsMobile()
  const year = selectedDate.getFullYear()

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{year}</h2>
      </div>

      {/* Mobile: 1 colonne (stack vertical) | Tablet: 2 colonnes | Desktop: 3-4 colonnes */}
      <div className={cn(
        "grid gap-3 md:gap-4 max-w-7xl mx-auto",
        isMobile ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      )}>
        {MONTHS.map((monthIndex) => (
          <MiniMonth key={monthIndex} monthIndex={monthIndex} year={year} />
        ))}
      </div>
    </div>
  )
}
