"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

type BulanData = {
  month: string
  Target: number
  Realisasi: number
  Sisa?: number
}

const allChartData: Record<string, BulanData[]> = {
  "2024": [
    { month: "January", Target: 1043122500, Realisasi: 1043122500 },
    { month: "February", Target: 0, Realisasi: 0 },
    { month: "March", Target: 0, Realisasi: 0 },
    { month: "April", Target: 0, Realisasi: 0 },
    { month: "May", Target: 2433952500, Realisasi: 2433952500 },
    { month: "June", Target: 4160280000, Realisasi: 4160280000 },
    { month: "July", Target: 0, Realisasi: 0 },
    { month: "August", Target: 2843820000, Realisasi: 2843820000 },
    { month: "September", Target: 0, Realisasi: 0 },
    { month: "October", Target: 3396600000, Realisasi: 3396600000 },
    { month: "November", Target: 572260477, Realisasi: 572260477 },
    { month: "December", Target: 0, Realisasi: 0 },
  ],
  "2023": [
    { month: "January", Target: 1043122500, Realisasi: 1043122500 },
    { month: "February", Target: 0, Realisasi: 0 },
    { month: "March", Target: 0, Realisasi: 0 },
    { month: "April", Target: 0, Realisasi: 0 },
    { month: "May", Target: 2433952500, Realisasi: 2433952500 },
    { month: "June", Target: 4160280000, Realisasi: 4160280000 },
    { month: "July", Target: 0, Realisasi: 0 },
    { month: "August", Target: 2843820000, Realisasi: 2843820000 },
    { month: "September", Target: 0, Realisasi: 0 },
    { month: "October", Target: 3396600000, Realisasi: 3396600000 },
    { month: "November", Target: 572260477, Realisasi: 572260477 },
    { month: "December", Target: 0, Realisasi: 0 },
  ],
}

const chartConfig: ChartConfig = {
  Realisasi: {
    label: "Realisasi",
    color: "var(--chart-2)",
  },
  Sisa: {
    label: "Sisa Target",
    color: "var(--chart-1)",
  },
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function formatPersen(value: number) {
  return `${value.toFixed(1)}%`
}

export function ChartBarStacked({ tahun }: { tahun: string }) {
  const chartData = useMemo(() => {
    const raw = allChartData[tahun] || []
    return raw.map((item: BulanData) => ({
      ...item,
      Sisa: Math.max(item.Target - item.Realisasi, 0),
    }))
  }, [tahun])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disburse AKI</CardTitle>
        <CardDescription>(Januari – Desember) - {tahun}</CardDescription>
      </CardHeader>

      <CardContent className="h-[220px] lg:h-[450px]">
        <ChartContainer config={chartConfig} className="h-full w-full relative">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={({ payload, label }) => {
                if (!payload?.length) return null
                const current = chartData.find((d) => d.month === label)
                if (!current || (current.Target === 0 && current.Realisasi === 0)) return null

                const persentase =
                  current.Target > 0 ? (current.Realisasi / current.Target) * 100 : 0

                return (
                  <div className="rounded-xl p-4 text-sm shadow-xl min-w-[220px] space-y-2 bg-white text-black">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="inline-block size-2 rounded-sm bg-neutral-400" />
                        <span className="text-muted-foreground">Target</span>
                      </span>
                      <span className="font-medium tabular-nums">{formatRupiah(current.Target)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="inline-block size-2 rounded-sm bg-black" />
                        <span className="text-muted-foreground">Realisasi</span>
                      </span>
                      <span className="font-medium tabular-nums">{formatRupiah(current.Realisasi)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Capaian</span>
                      <span className="font-medium tabular-nums">{formatPersen(persentase)}</span>
                    </div>
                  </div>
                )
              }}
            />
            <Bar
              dataKey="Realisasi"
              stackId="a"
              fill="black"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Sisa"
              stackId="a"
              fill="rgba(0, 0, 0, 0.3)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="justify-center gap-6 pt-4 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-black" />
          <span className="leading-none">Realisasi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-neutral-400" />
          <span className="leading-none">Target</span>
        </div>
      </CardFooter>
    </Card>
  )
}
