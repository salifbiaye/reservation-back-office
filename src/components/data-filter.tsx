"use client"

import { Filter, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo, useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-media-query"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SortOption {
  label: string
  value: string
  field: string
}

interface ExtraSelectFilter {
  type: "select"
  name: string
  label: string
  options: { label: string; value: string }[]
}

export interface DataFilterProps {
  /** Options de tri */
  sortOptions?: SortOption[]

  /** Activer le filtre par plage de dates */
  dateRangeEnabled?: boolean

  /** Activer le filtre par date spécifique */
  dateEnabled?: boolean

  /** Filtres supplémentaires (sélecteurs indépendants) */
  extraFilters?: ExtraSelectFilter[]
}

export function DataFilter({
                             sortOptions = [],
                             dateRangeEnabled = false,
                             dateEnabled = false,
                             extraFilters = [],
                           }: DataFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const [sheetOpen, setSheetOpen] = useState(false)

  const currentSort = searchParams.get("sort") || sortOptions[0]?.field || ""
  const currentOrder = (searchParams.get("order") || "desc") as "asc" | "desc"

  const [startDate, setStartDate] = useState<string>(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState<string>(searchParams.get("endDate") || "")
  const [specificDate, setSpecificDate] = useState<string>(searchParams.get("date") || "")

  const updateParams = useCallback(
      (updater: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams)
        updater(params)
        params.set("page", "1")
        router.replace(`${pathname}?${params.toString()}`,{ scroll: false })
      },
      [searchParams, router, pathname]
  )

  const onChangeSort = (option: SortOption) => {
    updateParams((p) => {
      p.set("sort", option.field)
    })
  }

  const toggleOrder = () => {
    updateParams((p) => {
      p.set("order", currentOrder === "asc" ? "desc" : "asc")
    })
  }

  const handleFilter = (name: string, value: string) => {
    updateParams((p) => {
      if (value === "__all__") p.delete(name)
      else p.set(name, value)
    })
  }

  const handleDateRange = (start?: string, end?: string) => {
    updateParams((p) => {
      if (start) p.set("startDate", start)
      else p.delete("startDate")
      if (end) p.set("endDate", end)
      else p.delete("endDate")
    })
  }

  const handleSpecificDate = (date: string) => {
    updateParams((p) => {
      if (date) p.set("date", date)
      else p.delete("date")
    })
  }

  const hasActiveFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("page")
    const onlyOrderDefault = params.size === 1 && params.get("order") === "desc"
    if (onlyOrderDefault) return false
    return params.size > 0
  }, [searchParams])

  const clearFilters = () => {
    updateParams((p) => {
      const keys = Array.from(p.keys())
      keys.forEach((k) => {
        if (k !== "page") p.delete(k)
      })
    })
  }

  useEffect(() => {
    setStartDate(searchParams.get("startDate") || "")
    setEndDate(searchParams.get("endDate") || "")
    setSpecificDate(searchParams.get("date") || "")
  }, [searchParams])

  const currentSortLabel = useMemo(() => {
    const found = sortOptions.find((o) => o.field === currentSort || o.value === currentSort)
    return found?.label || (sortOptions[0]?.label ?? "Trier")
  }, [sortOptions, currentSort])

  // Détermine si on a besoin du sheet (dates ou beaucoup de filtres)
  const needsSheet = isMobile && (dateRangeEnabled || dateEnabled || extraFilters.length > 2)

  // Mobile avec sheet (pour filtres complexes)
  if (needsSheet) {
    return (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setSheetOpen(true)}
                className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    !
                  </Badge>
              )}
            </Button>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                >
                  Effacer
                </Button>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtres et tri</SheetTitle>
                <SheetDescription>
                  Personnalisez l&apos;affichage de vos données
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {sortOptions.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Trier par</Label>
                      <Select value={currentSort} onValueChange={(value) => {
                        const option = sortOptions.find(o => o.field === value)
                        if (option) onChangeSort(option)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                              <SelectItem key={option.value} value={option.field}>
                                {option.label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Ordre</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleOrder}
                            className="gap-2"
                        >
                          {currentOrder === "asc" ? (
                              <>
                                <ArrowUp className="h-4 w-4" />
                                Croissant
                              </>
                          ) : (
                              <>
                                <ArrowDown className="h-4 w-4" />
                                Décroissant
                              </>
                          )}
                        </Button>
                      </div>
                    </div>
                )}

                {extraFilters.map((f) => {
                  const current = searchParams.get(f.name) || "__all__"
                  const validOptions = f.options.filter(opt => opt.value !== "")
                  return (
                      <div key={f.name} className="space-y-3">
                        <Label className="text-sm font-medium">{f.label}</Label>
                        <Select value={current} onValueChange={(value) => handleFilter(f.name, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__all__">Tous</SelectItem>
                            {validOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                  )
                })}

                {dateRangeEnabled && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Période</Label>
                      <div className="space-y-2">
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => {
                              const v = e.target.value
                              setStartDate(v)
                              handleDateRange(v, endDate)
                            }}
                            className="w-full px-3 py-2 text-sm border border-border/50 rounded bg-background"
                            placeholder="Date début"
                        />
                        <span className="text-sm text-muted-foreground">à</span>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => {
                              const v = e.target.value
                              setEndDate(v)
                              handleDateRange(startDate, v)
                            }}
                            className="w-full px-3 py-2 text-sm border border-border/50 rounded bg-background"
                            placeholder="Date fin"
                        />
                      </div>
                    </div>
                )}

                {dateEnabled && !dateRangeEnabled && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Date</Label>
                      <input
                          type="date"
                          value={specificDate}
                          onChange={(e) => {
                            const v = e.target.value
                            setSpecificDate(v)
                            handleSpecificDate(v)
                          }}
                          className="w-full px-3 py-2 text-sm border border-border/50 rounded bg-background"
                      />
                    </div>
                )}

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={() => {
                          clearFilters()
                          setSheetOpen(false)
                        }}
                        className="w-full"
                    >
                      Effacer tous les filtres
                    </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </>
    )
  }

  // Mobile/Desktop inline (pour filtres simples)
  return (
      <div className="flex flex-wrap items-center gap-2">
        {sortOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {currentSortLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                      <DropdownMenuItem
                          key={option.value}
                          onClick={() => onChangeSort(option)}
                          className="flex items-center justify-between cursor-pointer"
                      >
                        <span className={currentSort === option.field ? "font-medium" : ""}>{option.label}</span>
                        {currentSort === option.field && (
                            <Badge variant="outline" className="text-xs">Actif</Badge>
                        )}
                      </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={toggleOrder} aria-label="Basculer l'ordre">
                {currentOrder === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                ) : (
                    <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
        )}

        {extraFilters.map((f) => {
          const current = searchParams.get(f.name) || ""
          const validOptions = f.options.filter(opt => opt.value !== "")
          const label = f.label
          return (
              <DropdownMenu key={f.name}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {label}
                    {current && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {validOptions.find((o) => o.value === current)?.label || current}
                        </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>{label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      onClick={() => handleFilter(f.name, "__all__")}
                      className="flex items-center justify-between cursor-pointer"
                  >
                    <span className={!current ? "font-medium" : ""}>Tous</span>
                    {!current && (
                        <Badge variant="outline" className="text-xs">Actif</Badge>
                    )}
                  </DropdownMenuItem>
                  {validOptions.map((opt) => (
                      <DropdownMenuItem
                          key={opt.value}
                          onClick={() => handleFilter(f.name, opt.value)}
                          className="flex items-center justify-between cursor-pointer"
                      >
                        <span className={current === opt.value ? "font-medium" : ""}>{opt.label}</span>
                        {current === opt.value && (
                            <Badge variant="outline" className="text-xs">Actif</Badge>
                        )}
                      </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
          )
        })}

        {dateRangeEnabled && (
            <div className="flex items-center gap-2">
              <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    const v = e.target.value
                    setStartDate(v)
                    handleDateRange(v, endDate)
                  }}
                  className="px-3 py-1 text-sm border border-border/50 rounded bg-background"
                  placeholder="Date début"
              />
              <span className="text-muted-foreground">à</span>
              <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    const v = e.target.value
                    setEndDate(v)
                    handleDateRange(startDate, v)
                  }}
                  className="px-3 py-1 text-sm border border-border/50 rounded bg-background"
                  placeholder="Date fin"
              />
            </div>
        )}

        {dateEnabled && !dateRangeEnabled && (
            <input
                type="date"
                value={specificDate}
                onChange={(e) => {
                  const v = e.target.value
                  setSpecificDate(v)
                  handleSpecificDate(v)
                }}
                className="px-3 py-1 text-sm border border-border/50 rounded bg-background"
                placeholder="Date"
            />
        )}

        {hasActiveFilters && (
            <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
            >
              Effacer
            </Button>
        )}
      </div>
  )
}