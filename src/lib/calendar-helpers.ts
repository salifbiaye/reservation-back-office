import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"

export interface CalendarCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
}

export function getCalendarCells(date: Date): CalendarCell[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const today = new Date()

  return days.map((day) => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isSameDay(day, today),
  }))
}

export function getEventsForDay(events: any[], date: Date) {
  return events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return eventStart <= dayEnd && eventEnd >= dayStart
  })
}

export function getEventsForMonth(events: any[], date: Date) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)

  return events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    return eventStart <= monthEnd && eventEnd >= monthStart
  })
}

export function getWeekDays(date: Date) {
  const dayOfWeek = date.getDay()
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)

  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    days.push(day)
  }
  return days
}

export interface EventWithPosition {
  event: any
  startCol: number // 0-6 (dimanche-samedi)
  span: number // nombre de jours
  row: number // ligne (pour éviter les chevauchements)
  weekIndex: number // index de la semaine dans le mois
}

export function calculateMonthEventPositions(
  events: any[],
  selectedDate: Date
): EventWithPosition[] {
  const cells = getCalendarCells(selectedDate)
  const weeks: CalendarCell[][] = []

  // Diviser les cellules en semaines
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const eventPositions: EventWithPosition[] = []

  // Pour chaque semaine
  weeks.forEach((week, weekIndex) => {
    const weekStart = week[0].date
    const weekEnd = week[6].date

    // Filtrer les événements qui intersectent cette semaine
    const weekEvents = events.filter((event) => {
      const eventStart = new Date(event.start)
      eventStart.setHours(0, 0, 0, 0)
      const eventEnd = new Date(event.end)
      eventEnd.setHours(23, 59, 59, 999)

      return eventStart <= weekEnd && eventEnd >= weekStart
    })

    // Trier par date de début puis par durée (plus long en premier)
    weekEvents.sort((a, b) => {
      const aStart = new Date(a.start).getTime()
      const bStart = new Date(b.start).getTime()
      if (aStart !== bStart) return aStart - bStart

      const aDuration = new Date(a.end).getTime() - aStart
      const bDuration = new Date(b.end).getTime() - bStart
      return bDuration - aDuration
    })

    // Assigner des rows (lignes) pour éviter les chevauchements
    const rowAssignments = new Map<any, number>()
    const rowEndDays = new Map<number, number>() // row -> dernier jour occupé

    weekEvents.forEach((event) => {
      const eventStart = new Date(event.start)
      eventStart.setHours(0, 0, 0, 0)
      const eventEnd = new Date(event.end)
      eventEnd.setHours(23, 59, 59, 999)

      // Calculer la colonne de début dans cette semaine
      const startCol = Math.max(0, Math.floor((eventStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)))

      // Calculer le span (nombre de jours dans cette semaine)
      const effectiveStart = eventStart < weekStart ? weekStart : eventStart
      const effectiveEnd = eventEnd > weekEnd ? weekEnd : eventEnd
      const span = Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Trouver la première ligne disponible
      let row = 0
      while (true) {
        const rowEndDay = rowEndDays.get(row) ?? -1
        if (startCol > rowEndDay) {
          // Cette ligne est disponible
          rowAssignments.set(event, row)
          rowEndDays.set(row, startCol + span - 1)
          break
        }
        row++
      }

      eventPositions.push({
        event,
        startCol,
        span,
        row: rowAssignments.get(event)!,
        weekIndex,
      })
    })
  })

  return eventPositions
}
