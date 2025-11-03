"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PieChartInteractiveProps {
  data: Array<{
    id: string
    name: string
    color: string
    reservationsCount: number
  }>
}

export function PieChartInteractive({ data }: PieChartInteractiveProps) {
  const id = "pie-interactive"

  // Préparer les données pour le graphique
  const chartData = React.useMemo(() => {
    return data.map((commission) => ({
      id: commission.id,
      name: commission.name,
      value: commission.reservationsCount,
      fill: commission.color,
    }))
  }, [data])

  // Configuration dynamique des couleurs
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Réservations",
      },
    }

    data.forEach((commission) => {
      config[commission.id] = {
        label: commission.name,
        color: commission.color,
      }
    })

    return config
  }, [data]) satisfies ChartConfig

  const [activeCommission, setActiveCommission] = React.useState(
    chartData[0]?.id || ""
  )

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.id === activeCommission),
    [activeCommission, chartData]
  )

  const totalReservations = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  )

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Distribution par commission</CardTitle>
            <CardDescription>Répartition des réservations</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-0">
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Distribution par commission</CardTitle>
          <CardDescription>Répartition des réservations</CardDescription>
        </div>
        <Select value={activeCommission} onValueChange={setActiveCommission}>
          <SelectTrigger
            className="ml-auto h-7 w-[160px] rounded-lg pl-2.5"
            aria-label="Sélectionner une commission"
          >
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {chartData.map((item) => {
              const config = chartConfig[item.id]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={item.id}
                  value={item.id}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: item.fill,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={(({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              ))}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {chartData[activeIndex]?.value?.toLocaleString() || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Réservations
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex-col gap-2 text-sm pb-4">
        <div className="flex items-center justify-between leading-none text-muted-foreground">
          <span>Total des réservations</span>
          <span className="font-bold text-foreground">{totalReservations.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
