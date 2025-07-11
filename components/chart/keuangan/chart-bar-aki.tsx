"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

type BulanData = {
  month: string
  Target: number
  Realisasi: number
  Sisa?: number
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
  const [rawData, setRawData] = useState<BulanData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/keuangan?type=aki&tahun=${tahun}`)
        const json = await res.json()

        const months = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember",
        ]

        const defaultStructure = months.map((month) => ({
          month,
          Target: 0,
          Realisasi: 0,
        }))

        const merged = defaultStructure.map((item) => {
          const found = json.find((d: any) => d.bulan === item.month)
          return found
            ? {
                month: found.bulan,
                Target: Number(found.target),
                Realisasi: Number(found.realisasi ?? 0),
              }
            : item
        })

        setRawData(merged)
      } catch (err) {
        console.error("Failed to fetch AKI data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tahun])

  const chartData = useMemo(() => {
    return rawData.map((item) => ({
      ...item,
      Sisa: Math.max(item.Target - item.Realisasi, 0),
    }))
  }, [rawData])

  const isAllZero = chartData.every(
    (d) => d.Target === 0 && d.Realisasi === 0
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4 mt-2" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
        <CardFooter className="justify-between px-6 pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    )
  }

  if (isAllZero) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Disburse AKI</CardTitle>
          <CardDescription>(Januari – Desember) - {tahun}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[220px] lg:h-[450px]">
          <span className="text-muted-foreground text-sm text-center">
            Belum ada data untuk tahun{" "}
            <span className="font-semibold text-foreground">{tahun}</span>.
          </span>
        </CardContent>
        <CardFooter className="justify-between px-6 pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </CardFooter>
      </Card>
    )
  }

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
