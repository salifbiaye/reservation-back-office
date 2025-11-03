"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {CalendarCheck, Clock, CheckCircle, XCircle, MapPin, ThumbsUp, ThumbsDown, LayoutDashboard} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {PageHeroSection} from "@/components/page-hero";

interface CEEDashboardProps {
  data: {
    overview: {
      total: number
      pending: number
      accepted: number
      rejected: number
    }
    myActions: {
      validated: number
      rejected: number
    }
    temporal: {
      today: number
      thisWeek: number
      thisMonth: number
    }
    locations: Array<{
      id: string
      name: string
      count: number
    }>
    commission: {
      id: string
      name: string
      color: string
    }
  }
}

export function CEEDashboard({ data }: CEEDashboardProps) {
  const statCards = [
    {
      title: "Total (Commission)",
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

  const maxLocationCount = Math.max(...data.locations.map(l => l.count), 1)

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeroSection
          icon={LayoutDashboard}
          title="Dashboard CEE"
          description={`${data.commission.name}`}


          visualIcon={LayoutDashboard}
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
        {/* Mes actions personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Mes actions de validation</CardTitle>
            <CardDescription>Réservations que vous avez traitées personnellement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/5">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-3 bg-green-500/10">
                  <ThumbsUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Validées par moi</p>
                  <p className="text-2xl font-bold text-green-600">{data.myActions.validated}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-3 bg-red-500/10">
                  <ThumbsDown className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Refusées par moi</p>
                  <p className="text-2xl font-bold text-red-600">{data.myActions.rejected}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total traité</span>
                <Badge variant="secondary" className="text-base">
                  {data.myActions.validated + data.myActions.rejected}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats temporelles */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Nouvelles réservations pour votre commission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Aujourd'hui</span>
                <Badge variant="secondary">{data.temporal.today}</Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: data.overview.total > 0 ? `${Math.min((data.temporal.today / data.overview.total) * 100, 100)}%` : '0%' }}
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
                  style={{ width: data.overview.total > 0 ? `${Math.min((data.temporal.thisWeek / data.overview.total) * 100, 100)}%` : '0%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Ce mois</span>
                <Badge variant="secondary">{data.temporal.thisMonth}</Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: data.overview.total > 0 ? `${Math.min((data.temporal.thisMonth / data.overview.total) * 100, 100)}%` : '0%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lieux de la commission */}
      <Card>
        <CardHeader>
          <CardTitle>Lieux de votre commission</CardTitle>
          <CardDescription>Répartition des réservations par lieu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {data.locations.map((location) => (
              <div key={location.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{location.name}</span>
                  </div>
                  <Badge>{location.count}</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(location.count / maxLocationCount) * 100}%`,
                      backgroundColor: data.commission.color,
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
