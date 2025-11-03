"use client"

import { createContext, useContext, useState } from "react"
import { CalendarReservationDetails } from "./calendar-reservation-details"

export type CalendarView = "day" | "week" | "month" | "year" | "agenda"

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

interface Location {
  id: string
  name: string
  commission: {
    name: string
    color: string
  }
}

interface CalendarContextType {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  selectedLocationId: string
  setSelectedLocationId: (id: string) => void
  locations: Location[]
  reservations: Reservation[]
  openReservationDetails: (reservation: Reservation) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

interface CalendarProviderProps {
  children: React.ReactNode
  locations: Location[]
  reservations: Reservation[]
}

export function CalendarProvider({ children, locations, reservations }: CalendarProviderProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  // Initialiser avec le premier lieu de la liste
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locations.length > 0 ? locations[0].id : ""
  )
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const openReservationDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDetailsModalOpen(true)
  }

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedLocationId,
        setSelectedLocationId,
        locations,
        reservations,
        openReservationDetails,
      }}
    >
      {children}

      {/* Modal de détails */}
      <CalendarReservationDetails
        reservation={selectedReservation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider")
  }
  return context
}
