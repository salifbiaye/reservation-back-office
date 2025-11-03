"use client"

import { CalendarHeader } from "./calendar-header"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { YearView } from "./year-view"
import { AgendaView } from "./agenda-view"
import type { CalendarView } from "./calendar-context"

interface CalendarClientContainerProps {
  view: CalendarView
}

export function CalendarClientContainer({ view }: CalendarClientContainerProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border">
      <CalendarHeader view={view} />

      <div className="flex-1 overflow-hidden">
        {view === "month" && <MonthView />}
        {view === "week" && <WeekView />}
        {view === "day" && <DayView />}
        {view === "year" && <YearView />}
        {view === "agenda" && <AgendaView />}
      </div>
    </div>
  )
}
