"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { LogoutButton } from "@/features/auth/logout-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Moon, Sun, LogOut, Home, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  reservations: "Réservations",
  locations: "Lieux",
  commissions: "Commissions",
  users: "Utilisateurs",
  calendar: "Calendrier",
  profile: "Mon Profil",
  new: "Nouveau",
  edit: "Modifier",
}

interface PageHeaderProps {
  title?: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = routeLabels[segment] || segment
    const isLast = index === segments.length - 1

    return {href, label, isLast}
  })

  return (
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        {/* Sidebar Trigger */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 hover:bg-muted transition-colors"/>
          <Separator orientation="vertical" className="h-6"/>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4 overflow-hidden">
          {/* Breadcrumb - Version Desktop */}
          <div className="hidden md:flex flex-1 min-w-0">
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap">
                <BreadcrumbItem>
                  <BreadcrumbLink
                      href="/dashboard"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    <span className="font-medium">Accueil</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.length > 0 && breadcrumbs[0].label !== "dashboard" && (
                    <>
                      {breadcrumbs.map((crumb) => (
                          <div key={crumb.href} className="flex items-center gap-2">
                            <BreadcrumbSeparator>
                              <ChevronRight className="h-4 w-4" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                              {crumb.isLast ? (
                                  <BreadcrumbPage className="font-semibold text-foreground">
                                    {crumb.label}
                                  </BreadcrumbPage>
                              ) : (
                                  <BreadcrumbLink
                                      href={crumb.href}
                                      className="font-medium hover:text-foreground transition-colors"
                                  >
                                    {crumb.label}
                                  </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                          </div>
                      ))}
                    </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Title sur mobile/tablette */}
          {breadcrumbs.length > 0 && (
              <div className="md:hidden flex-1 min-w-0">
                <h1 className="text-base font-semibold truncate">
                  {breadcrumbs[breadcrumbs.length - 1].label}
                </h1>
              </div>
          )}

          {/* Title & Description - Desktop uniquement */}
          {(title || description) && (
              <div className="hidden xl:flex flex-col items-end text-right flex-shrink-0 max-w-md">
                {title && (
                    <h1 className="text-sm font-semibold leading-tight truncate w-full">
                      {title}
                    </h1>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground leading-tight truncate w-full mt-0.5">
                      {description}
                    </p>
                )}
              </div>
          )}

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <ModeToggle/>
            <Separator orientation="vertical" className="h-6" />
            <LogoutButton variant="button" className="h-9">
              Déconnexion
            </LogoutButton>
          </div>

          {/* Actions - Mobile (Menu dropdown) */}
          <div className="md:hidden flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-muted transition-colors"
                >
                  <MoreVertical className="h-5 w-5"/>
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold">
                  Paramètres
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Thème clair */}
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer py-2.5"
                >
                  <Sun className="mr-3 h-4 w-4" />
                  <span>Thème clair</span>
                  {theme === "light" && (
                      <span className="ml-auto text-primary font-semibold">✓</span>
                  )}
                </DropdownMenuItem>

                {/* Thème sombre */}
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer py-2.5"
                >
                  <Moon className="mr-3 h-4 w-4" />
                  <span>Thème sombre</span>
                  {theme === "dark" && (
                      <span className="ml-auto text-primary font-semibold">✓</span>
                  )}
                </DropdownMenuItem>

                {/* Système */}
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="cursor-pointer py-2.5"
                >
                  <div className="mr-3 h-4 w-4 relative">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute top-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                  <span>Système</span>
                  {theme === "system" && (
                      <span className="ml-auto text-primary font-semibold">✓</span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Déconnexion */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <LogoutButton
                      variant="link"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 py-2.5"
                  >
                    <span>Déconnexion</span>
                  </LogoutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
  )
}