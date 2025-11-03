"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Mail,
  Loader2,
  BarChart3
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaChartInteractive } from "./charts/area-chart-interactive"
import { PieChartInteractive } from "./charts/pie-chart-interactive"
import {PageHeroSection} from "@/components/page-hero"
import { useState } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface AdminDashboardProps {
  data: {
    overview: {
      total: number
      pending: number
      accepted: number
      rejected: number
    }
    temporal: {
      today: number
      thisWeek: number
      thisMonth: number
      lastMonth: number
      monthGrowth: number
    }
    topLocations: Array<{
      id: string
      name: string
      count: number
    }>
    commissions: Array<{
      id: string
      name: string
      color: string
      reservationsCount: number
    }>
  }
  timeSeriesData: Array<{
    date: string
    pending: number
    accepted: number
    rejected: number
    total: number
  }>
}

export function AdminDashboard({ data, timeSeriesData }: AdminDashboardProps) {
  const [isSending, setIsSending] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "previous">("previous")

  const handleSendMonthlyReport = async (period: "current" | "previous") => {
    try {
      setIsSending(true)
      const periodLabel = period === "current" ? "mois en cours" : "mois précédent"
      toast.loading(`Envoi du rapport du ${periodLabel}...`)

      const response = await fetch(`/api/cron/monthly-report?period=${period}`, {
        method: "GET",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi du rapport")
      }

      toast.dismiss()
      toast.success("Rapport mensuel envoyé avec succès!", {
        description: result.message,
      })
    } catch (error) {
      toast.dismiss()
      toast.error("Erreur lors de l'envoi du rapport", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      setIsSending(false)
    }
  }

  const statCards = [
    {
      title: "Total réservations",
      value: data.overview.total,
      icon: CalendarCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "En attente",
      value: data.overview.pending,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Acceptées",
      value: data.overview.accepted,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Refusées",
      value: data.overview.rejected,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  const maxLocationCount = Math.max(...data.topLocations.map(l => l.count), 1)
  const maxCommissionCount = Math.max(...data.commissions.map(c => c.reservationsCount), 1)

  return (
      <div className="flex-1 space-y-6 p-6">

        <PageHeroSection
            icon={LayoutDashboard}
            title="Dashboard Administrateur"
            description="Vue d&apos;ensemble complète du système de réservation"
            visualIcon={LayoutDashboard}
            primaryAction={{
              label: isSending ? "Envoi en cours..." : "Envoyer rapport mensuel",
              icon: isSending ? Loader2 : Mail,
              onClick: () => handleSendMonthlyReport(selectedPeriod)
            }}
            secondaryAction={{
              label: selectedPeriod === "current" ? "Mois en cours" : "Mois précédent",
              icon: BarChart3,
              onClick: () => setSelectedPeriod(selectedPeriod === "current" ? "previous" : "current")
            }}
        />


        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`rounded-full p-3 ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Stats temporelles */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des réservations</CardTitle>
              <CardDescription>Comparaison sur différentes périodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Aujourd&apos;hui</span>
                  <Badge variant="secondary">{data.temporal.today}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min((data.temporal.today / data.overview.total) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cette semaine</span>
                  <Badge variant="secondary">{data.temporal.thisWeek}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${Math.min((data.temporal.thisWeek / data.overview.total) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ce mois</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{data.temporal.thisMonth}</Badge>
                    <Badge variant={data.temporal.monthGrowth >= 0 ? "default" : "destructive"}>
                      {data.temporal.monthGrowth >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(data.temporal.monthGrowth).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min((data.temporal.thisMonth / data.overview.total) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Mois dernier</span>
                  <Badge variant="outline">{data.temporal.lastMonth}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                      className="h-full bg-muted-foreground/30 transition-all"
                      style={{ width: `${Math.min((data.temporal.lastMonth / data.overview.total) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 lieux les plus réservés</CardTitle>
              <CardDescription>Classement par nombre de réservations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.topLocations.map((location, index) => (
                  <div key={location.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium truncate">{location.name}</span>
                      </div>
                      <Badge>{location.count}</Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                          className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all"
                          style={{ width: `${(location.count / maxLocationCount) * 100}%` }}
                      />
                    </div>
                  </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Graphiques interactifs */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Area Chart - Évolution temporelle */}
          <AreaChartInteractive data={timeSeriesData} />

          {/* Pie Chart - Distribution par commission */}
          <PieChartInteractive data={data.commissions} />
        </div>

        {/* Stats par commission - Vue détaillée */}
        <Card>
          <CardHeader>
            <CardTitle>Réservations par commission</CardTitle>
            <CardDescription>Distribution détaillée des réservations entre les différentes commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.commissions.map((commission) => (
                  <div key={commission.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: commission.color }}
                        />
                        <span className="text-sm font-medium">{commission.name}</span>
                      </div>
                      <Badge variant="secondary">{commission.reservationsCount}</Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                          className="h-full transition-all"
                          style={{
                            width: `${(commission.reservationsCount / maxCommissionCount) * 100}%`,
                            backgroundColor: commission.color,
                          }}
                      />
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}