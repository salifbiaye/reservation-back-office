"use client"

import { useSession } from "@/lib/auth-client"
import { CalendarCheck, Clock, CheckCircle, XCircle } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    total: number
    pending: number
    accepted: number
    rejected: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { data: session } = useSession()

  const statCards = [
    {
      title: "Total réservations",
      value: stats.total,
      icon: CalendarCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "En attente",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Acceptées",
      value: stats.accepted,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Refusées",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenue, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          {session?.user?.role === "ADMIN"
            ? "Vue d'ensemble de toutes les réservations"
            : "Réservations de votre commission"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
        <p className="text-sm text-muted-foreground">
          Les dernières réservations apparaîtront ici.
        </p>
      </div>
    </div>
  )
}
