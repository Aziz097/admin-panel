"use client"

import * as React from "react"
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const rawData = {
  "Semester 1": {
    Target: 7366358457,
    Realisasi: 7375835136,
  },
  "Semester 2": {
    Target: 6964180930,
    Realisasi: 7016224951,
  },
}

const chartConfig = {
  Target: { label: "Target" },
  Realisasi: { label: "Realisasi" },
} satisfies ChartConfig

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function ChartRadialStacked() {
  const [view, setView] = React.useState<"Semester 1" | "Semester 2" | "Akumulasi">("Semester 1")

  const currentData =
    view === "Akumulasi"
      ? {
          Target: rawData["Semester 1"].Target + rawData["Semester 2"].Target,
          Realisasi: rawData["Semester 1"].Realisasi + rawData["Semester 2"].Realisasi,
        }
      : rawData[view]

  const chartData = [
    {
      name: view,
      Target: currentData.Target,
      Realisasi: currentData.Realisasi,
    },
  ]

  const percentage = (currentData.Realisasi / currentData.Target) * 100
  const formattedPercentage = percentage.toFixed(2) + "%"

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-0">
        <div>
          <CardTitle>Penarikan ATTB</CardTitle>
          <CardDescription>{view} - 2024</CardDescription>
        </div>

        <Select value={view} onValueChange={(val) => setView(val as typeof view)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semester 1">Semester 1</SelectItem>
            <SelectItem value="Semester 2">Semester 2</SelectItem>
            <SelectItem value="Akumulasi">Akumulasi</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={({ payload }) => {
                if (!payload?.length) return null
                return (
                  <div className="rounded-xl p-4 text-sm shadow-xl min-w-[220px] space-y-2 bg-white text-black">
                    {payload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: entry.color }} />
                          <span className="text-muted-foreground">{entry.name}</span>
                        </span>
                        <span className="font-medium tabular-nums">{formatRupiah(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {formattedPercentage}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-sm"
                        >
                          {view}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="Realisasi"
              fill="black"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="Target"
              stackId="a"
              cornerRadius={5}
              fill="rgba(0, 0, 0, 0.3)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="mt-[-100px] justify-center gap-4 pt-3 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm bg-black" />
          <span>Realisasi:</span>
          <span className="font-medium text-foreground">{formatRupiah(currentData.Realisasi)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm bg-neutral-400" />
          <span>Target:</span>
          <span className="font-medium text-foreground">{formatRupiah(currentData.Target)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
