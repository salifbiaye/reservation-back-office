"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Columns, Grid2x2, Grid3x3, List, CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useCalendar } from "./calendar-context"
import { LocationSelect } from "./location-select"
import type { CalendarView } from "./calendar-context"

interface CalendarHeaderProps {
  view: CalendarView
}

export function CalendarHeader({ view }: CalendarHeaderProps) {
  const { selectedDate, setSelectedDate } = useCalendar()

  const goToPrevious = () => {
    const newDate = new Date(selectedDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "year") {
      newDate.setFullYear(newDate.getFullYear() - 1)
    }
    setSelectedDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(selectedDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "year") {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const getDateLabel = () => {
    if (view === "day") {
      return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
    } else if (view === "week") {
      return format(selectedDate, "MMMM yyyy", { locale: fr })
    } else if (view === "month" || view === "agenda") {
      return format(selectedDate, "MMMM yyyy", { locale: fr })
    } else if (view === "year") {
      return format(selectedDate, "yyyy", { locale: fr })
    }
  }

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button onClick={goToToday} variant="outline" size="sm">
          Aujourd'hui
        </Button>

        <div className="flex items-center gap-1">
          <Button onClick={goToPrevious} variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goToNext} variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold capitalize">{getDateLabel()}</h2>
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          <div className="inline-flex">
            <Button
              asChild
              size="icon"
              variant={view === "day" ? "default" : "outline"}
              className="rounded-r-none"
            >
              <Link href="/calendar/day">
                <List className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="icon"
              variant={view === "week" ? "default" : "outline"}
              className="-ml-px rounded-none"
            >
              <Link href="/calendar/week">
                <Columns className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="icon"
              variant={view === "month" ? "default" : "outline"}
              className="-ml-px rounded-none"
            >
              <Link href="/calendar/month">
                <Grid2x2 className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="icon"
              variant={view === "year" ? "default" : "outline"}
              className="-ml-px rounded-none"
            >
              <Link href="/calendar/year">
                <Grid3x3 className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="icon"
              variant={view === "agenda" ? "default" : "outline"}
              className="-ml-px rounded-l-none"
            >
              <Link href="/calendar/agenda">
                <CalendarRange className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <LocationSelect />
        </div>
      </div>
    </div>
  )
}
