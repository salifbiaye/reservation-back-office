"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

interface DataSearchProps {
  /**
   * Placeholder du champ de recherche
   */
  placeholder?: string

  /**
   * Nom du paramètre URL (défaut: "search")
   */
  paramName?: string

  /**
   * Délai de debounce en ms (défaut: 300ms)
   */
  debounceMs?: number

  /**
   * Désactiver le scroll automatique vers le haut (défaut: false)
   */
  disableScroll?: boolean
}

export function DataSearch({
  placeholder = "Rechercher...",
  paramName = "search",
  debounceMs = 600,
  disableScroll = false
}: DataSearchProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [value, setValue] = useState(searchParams.get(paramName) || "")

  // Fonction pour mettre à jour l'URL
  const updateUrl = useCallback((searchValue: string) => {
    const params = new URLSearchParams(searchParams)

    if (searchValue) {
      params.set(paramName, searchValue)
      // Reset page to 1 when searching
      params.set("page", "1")
    } else {
      params.delete(paramName)
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: !disableScroll })
  }, [searchParams, paramName, router, pathname, disableScroll])

  // Mettre à jour l'URL quand la valeur change (avec debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(value)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [value, updateUrl, debounceMs])

  // Synchroniser avec les params URL si ils changent (navigation back/forward)
  useEffect(() => {
    const currentValue = searchParams.get(paramName) || ""
    if (currentValue !== value) {
      setValue(currentValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramName])

  const handleClear = () => {
    setValue("")
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 pr-10 bg-background border-border/50 focus:border-primary/50"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
