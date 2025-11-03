"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  MapPin,
  Users,
  Building2,
  LogOut,
  UserCircle,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserProfileCard } from "@/features/profile/users-profile"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["CEE", "ADMIN"],
    description: "Vue d'ensemble"
  },
  {
    title: "Réservations",
    href: "/reservations",
    icon: CalendarCheck,
    roles: ["CEE", "ADMIN"],
    description: "Gérer les réservations"
  },
  {
    title: "Calendrier",
    href: "/calendar",
    icon: Calendar,
    roles: ["CEE", "ADMIN"],
    description: "Planning des salles"
  },
  {
    title: "Lieux",
    href: "/locations",
    icon: MapPin,
    roles: ["ADMIN"],
    description: "Gérer les salles"
  },
  {
    title: "Commissions",
    href: "/commissions",
    icon: Building2,
    roles: ["ADMIN"],
    description: "Gérer les commissions"
  },
  {
    title: "Utilisateurs",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
    description: "Gérer les utilisateurs"
  },
  {
    title: "Mon Profil",
    href: "/profile",
    icon: UserCircle,
    description: "Gérer mon profil",
    roles: ["ADMIN","CEE"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  const filteredNavItems = navItems.filter(item =>
      item.roles.includes(userRole as string)
  )

  return (
      <Sidebar className="border-r bg-gray-900 dark:bg-muted ">
        <SidebarHeader className=" dark:border-border bg-gray-900 dark:bg-muted px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base text-gray-300 dark:text-muted-foreground font-bold tracking-tight">ESP Réservation</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-3 py-6 bg-gray-900 dark:bg-muted">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-300 dark:text-muted-foreground mb-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  const Icon = item.icon

                  return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="h-auto py-3 px-3 "
                        >
                          <Link href={item.href} className="flex items-start gap-3">
                            <Icon className="  text-gray-300 dark:text-muted-foreground h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm  text-gray-300 dark:text-muted-foreground font-medium">{item.title}</span>
                              <span className="text-xs  text-gray-300 dark:text-muted-foreground leading-tight">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-800 dark:border-border px-3 py-4 space-y-2 bg-gray-900 dark:bg-muted">
          <SidebarMenu>
            <SidebarMenuItem>
              <UserProfileCard
                  user={{
                    name: session?.user?.name,
                    email: session?.user?.email,
                    image: session?.user?.image,
                  }}
                  role={userRole as "ADMIN" | "CEE" | "STUDENT"}
                  commissionName={session?.user?.commission?.name}
                  commissionColor={session?.user?.commission?.color}
              />
            </SidebarMenuItem>

            <div className="h-px bg-gray-800  dark:bg-border my-2" />



            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  className="h-auto py-2.5 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Link href="/logout" className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
  )
}