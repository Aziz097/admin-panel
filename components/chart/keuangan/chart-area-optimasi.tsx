"use client"

import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import rawData, { DataItem } from "../../data"

const chartConfig: ChartConfig = {
  Penetapan: { label: "Penetapan", color: "var(--chart-1)" },
  Optimasi: { label: "Optimasi", color: "var(--chart-2)" },
  Realisasi: { label: "Realisasi", color: "var(--chart-3)" },
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function calculateTotalKategori(dataPerTahun: { [category: string]: DataItem[] }): DataItem[] {
  const months = dataPerTahun[Object.keys(dataPerTahun)[0]].map(d => d.month)
  return months.map((month, index) => {
    const total: DataItem = { month, Penetapan: 0, Optimasi: 0, Realisasi: 0 }
    for (const category of Object.values(dataPerTahun)) {
      const item = category[index]
      total.Penetapan += item.Penetapan
      total.Optimasi += item.Optimasi
      total.Realisasi += item.Realisasi
    }
    return total
  })
}

export function ChartAreaGradient({ tahun }: { tahun: string }) {
  const dataPerTahun = useMemo(() => {
    const withTotal: { [category: string]: DataItem[] } = {
      Total: calculateTotalKategori(rawData[tahun]),
      ...rawData[tahun],
    }
    return withTotal
  }, [tahun])

  const kategoriList = Object.keys(dataPerTahun)
  const [kategori, setKategori] = useState("Total")

  const chartData = dataPerTahun[kategori]

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
        <div>
          <CardTitle>Optimasi 5.4</CardTitle>
          <CardDescription>
            {kategori} - {tahun}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              {kategoriList.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-[170px] lg:h-[450px]">
        <ChartContainer config={chartConfig} className="h-full w-full relative">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={({ payload, label }) => {
                if (!payload?.length) return null
                const current = chartData.find((d) => d.month === label)
                if (!current) return null
                return (
                  <div className="rounded-xl p-4 text-sm shadow-xl min-w-[220px] space-y-2 bg-white text-black">
                    {(["Penetapan", "Optimasi", "Realisasi"] as const).map((key) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: chartConfig[key].color }} />
                          <span className="text-muted-foreground">{key}</span>
                        </span>
                        <span className="font-medium tabular-nums">
                          {formatRupiah(current[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <defs>
              {(["Penetapan", "Optimasi", "Realisasi"] as const).map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <Area dataKey="Realisasi" type="natural" fill="url(#fill-Realisasi)" stroke={chartConfig.Realisasi.color} stackId="a" fillOpacity={0.4} />
            <Area dataKey="Optimasi" type="natural" fill="url(#fill-Optimasi)" stroke={chartConfig.Optimasi.color} stackId="a" fillOpacity={0.4} />
            <Area dataKey="Penetapan" type="natural" fill="url(#fill-Penetapan)" stroke={chartConfig.Penetapan.color} stackId="a" fillOpacity={0.4} />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="justify-center gap-6 pt-4 text-sm text-muted-foreground flex-wrap">
        {(["Realisasi", "Optimasi", "Penetapan"] as const).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="inline-block size-3 rounded-sm" style={{ backgroundColor: chartConfig[key].color }} />
            <span>{key}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}
