"use client"

import { useCalendar } from "./calendar-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LocationSelect() {
  const { locations, selectedLocationId, setSelectedLocationId } = useCalendar()

  return (
    <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue placeholder="Sélectionner un lieu" />
      </SelectTrigger>

      <SelectContent align="end">
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: location.commission.color }}
              />
              <span className="truncate">{location.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
