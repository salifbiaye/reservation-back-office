"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface DataPaginationProps {
  /**
   * Nombre total d'éléments
   */
  totalItems: number

  /**
   * Nombre d'éléments par page par défaut
   */
  defaultPageSize?: number

  /**
   * Options pour le nombre d'éléments par page
   */
  pageSizeOptions?: number[]

  /**
   * Nom du paramètre URL pour la page (défaut: "page")
   */
  pageParam?: string

  /**
   * Nom du paramètre URL pour la taille de page (défaut: "limit")
   */
  limitParam?: string
}

export function DataPagination({
  totalItems,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  pageParam = "page",
  limitParam = "limit"
}: DataPaginationProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(searchParams.get(pageParam) || "1")
    return isNaN(page) || page < 1 ? 1 : page
  })
  const [pageSize, setPageSize] = useState(() => {
    const size = parseInt(searchParams.get(limitParam) || defaultPageSize.toString())
    return isNaN(size) || size < 1 ? defaultPageSize : size
  })

  const totalPages = Math.max(1, Math.ceil(totalItems / (pageSize || 1)))
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0

  // Synchroniser avec les URL params
  useEffect(() => {
    const page = parseInt(searchParams.get(pageParam) || "1")
    const size = parseInt(searchParams.get(limitParam) || defaultPageSize.toString())
    setCurrentPage(isNaN(page) || page < 1 ? 1 : page)
    setPageSize(isNaN(size) || size < 1 ? defaultPageSize : size)
  }, [searchParams, pageParam, limitParam, defaultPageSize])

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value)
    })

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updateUrl({ [pageParam]: page.toString() })
    }
  }

  const changePageSize = (newSize: string) => {
    const newPageSize = parseInt(newSize)
    if (isNaN(newPageSize) || newPageSize < 1) return

    const newTotalPages = Math.max(1, Math.ceil(totalItems / newPageSize))
    const newPage = currentPage > newTotalPages ? 1 : currentPage

    updateUrl({
      [limitParam]: newSize,
      [pageParam]: newPage.toString()
    })
  }

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (isNaN(totalPages) || totalPages <= 0) {
      return [1]
    }

    if (totalPages <= maxVisible) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Logique pour afficher pages avec ellipses
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalItems === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Informations */}
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Affichage de {startItem} à {endItem} sur {totalItems} résultats
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
        {/* Sélecteur de taille de page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Afficher</span>
          <Select value={pageSize.toString()} onValueChange={changePageSize}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground hidden sm:inline">par page</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          {/* Bouton précédent */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Numéros de pages */}
          {getPageNumbers().map((page, index) => (
            <div key={index} className={page === "..." ? "hidden xs:block" : ""}>
              {page === "..." ? (
                <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page as number)}
                  className={`h-8 w-8 p-0 ${
                    // Sur très petit écran, ne montrer que la page actuelle et les adjacentes
                    Math.abs((page as number) - currentPage) > 1 ? "hidden xs:block" : ""
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}

          {/* Bouton suivant */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
