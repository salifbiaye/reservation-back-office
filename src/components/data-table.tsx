"use client"

import { ReactNode } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

export interface ColumnDef<T = any> {
  /**
   * Clé de la donnée
   */
  key: string

  /**
   * Label de la colonne
   */
  label: string

  /**
   * Fonction de rendu personnalisé
   */
  render?: (value: any, item: T) => ReactNode

  /**
   * CSS classe pour la cellule
   */
  className?: string

  /**
   * Colonne triable
   */
  sortable?: boolean

  /**
   * Largeur de la colonne
   */
  width?: string
}

export interface RowAction<T = any> {
  label: string
  onClick: (item: T) => void
  variant?: "default" | "destructive"
  /**
   * Condition pour afficher l'action
   */
  show?: (item: T) => boolean
}

interface DataTableProps<T = any> {
  /**
   * Données à afficher
   */
  data: T[]

  /**
   * Définition des colonnes
   */
  columns: ColumnDef<T>[]

  /**
   * Actions sur les lignes (statique)
   */
  actions?: RowAction<T>[]

  /**
   * Fonction pour obtenir les actions par ligne (dynamique)
   */
  getActions?: (item: T) => RowAction<T>[]

  /**
   * Titre du tableau
   */
  title?: string

  /**
   * Description du tableau
   */
  description?: string

  /**
   * Contenu de l'en-tête (search, filters, etc.)
   */
  headerContent?: ReactNode

  /**
   * Contenu du pied de page (pagination)
   */
  footerContent?: ReactNode

  /**
   * État de chargement
   */
  loading?: boolean

  /**
   * État vide personnalisé
   */
  emptyState?: ReactNode

  /**
   * Fonction pour définir les classes CSS des lignes
   */
  rowClassName?: (item: T) => string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  getActions,
  title,
  description,
  headerContent,
  footerContent,
  loading = false,
  emptyState,
  rowClassName
}: DataTableProps<T>) {
  const isMobile = useIsMobile()

  const renderCellValue = (column: ColumnDef<T>, item: T) => {
    const value = item[column.key]

    if (column.render) {
      return column.render(value, item)
    }

    // Rendu par défaut selon le type
    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Actif" : "Inactif"}
        </Badge>
      )
    }

    if (value instanceof Date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(value)
    }

    if (typeof value === "string" && value.includes("@")) {
      return <span className="text-muted-foreground">{value}</span>
    }

    return value?.toString() || "-"
  }

  const hasActions = actions.length > 0 || !!getActions

  const LoadingSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} style={{ width: column.width }}>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </TableHead>
          ))}
          {hasActions && (
            <TableHead className="w-10">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </TableCell>
            ))}
            {hasActions && (
              <TableCell>
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      {(title || description || headerContent) && (
        <CardHeader className="space-y-4">
          {(title || description) && (
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {headerContent && <div>{headerContent}</div>}
        </CardHeader>
      )}

      <CardContent className={cn("p-0", isMobile && "p-3")}>
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : data.length === 0 ? (
          <div className="p-6">
            {emptyState || (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="space-y-3">
            {data.map((item, index) => {
              const rowActions = getActions ? getActions(item) : actions
              const visibleActions = rowActions.filter(
                (action) => !action.show || action.show(item)
              )

              return (
                <Card
                  key={item.id || index}
                  className={cn(
                    "bg-card/30 backdrop-blur-sm border-border/50",
                    rowClassName ? rowClassName(item) : ''
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    {columns.map((column) => (
                      <div key={column.key} className="flex justify-between items-start gap-2">
                        <span className="text-xs text-muted-foreground font-medium min-w-[80px]">
                          {column.label}
                        </span>
                        <div className="text-sm text-right flex-1">
                          {renderCellValue(column, item)}
                        </div>
                      </div>
                    ))}
                    {hasActions && visibleActions.length > 0 && (
                      <div className="flex gap-2 pt-2 border-t border-border/50">
                        {visibleActions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant === "destructive" ? "destructive" : "secondary"}
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => action.onClick(item)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          // Desktop Table View
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.className}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {hasActions && (
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                // Get actions for this row (either from getActions or static actions)
                const rowActions = getActions ? getActions(item) : actions
                const visibleActions = rowActions.filter(
                  (action) => !action.show || action.show(item)
                )

                return (
                  <TableRow
                    key={item.id || index}
                    className={`border-border/50 hover:bg-muted/25 transition-colors ${rowClassName ? rowClassName(item) : ''}`}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={column.className}
                      >
                        {renderCellValue(column, item)}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell>
                        {visibleActions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {visibleActions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(item)}
                                  className={
                                    action.variant === "destructive"
                                      ? "text-destructive focus:text-destructive"
                                      : ""
                                  }
                                >
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {footerContent && (
          <div className="p-4 border-t border-border/50">
            {footerContent}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
