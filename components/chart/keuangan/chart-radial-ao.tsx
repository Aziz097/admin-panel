"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Semester = "Semester 1" | "Semester 2" | "Akumulasi"

type SemesterData = { Target: number; Realisasi: number }
type YearData = Record<Exclude<Semester, "Akumulasi">, SemesterData>
type RawData = Record<string, YearData>

const chartConfig = {
  Target: { label: "Target" },
  Realisasi: { label: "Realisasi" },
} satisfies ChartConfig

function formatRupiah(value: number | null | undefined) {
  if (typeof value !== "number") return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function ChartRadialAO({ tahun }: { tahun: string }) {
  const [semester, setSemester] = React.useState<Semester>("Semester 1")
  const [rawData, setRawData] = React.useState<RawData>({})
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/keuangan?type=ao")
        const json = await res.json()

        if (!Array.isArray(json)) {
          console.error("Expected array but got:", json)
          return
        }

        const transformed: RawData = {}

        for (const entry of json) {
          const semKey: "Semester 1" | "Semester 2" =
            entry.semester === "1" ? "Semester 1" : "Semester 2"

          if (!transformed[entry.tahun]) {
            transformed[entry.tahun] = {
              "Semester 1": { Target: 0, Realisasi: 0 },
              "Semester 2": { Target: 0, Realisasi: 0 },
            }
          }

          transformed[entry.tahun][semKey] = {
            Target: Number(entry.target),
            Realisasi: Number(entry.realisasi ?? 0),
          }
        }

        setRawData(transformed)
      } catch (error) {
        console.error("Failed to fetch AO data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[210px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
        <CardFooter className="justify-between px-4 pb-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
        </CardFooter>
      </Card>
    )
  }

  const currentYearData = rawData[tahun]

  if (!currentYearData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>Penyerapan AO</CardTitle>
            <CardDescription>
              {semester} - {tahun}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[220px] lg:h-[300px] gap-2">
          <span className="text-sm text-muted-foreground text-center">
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

  const currentData =
    semester === "Akumulasi"
      ? {
          Target:
            currentYearData["Semester 1"].Target +
            currentYearData["Semester 2"].Target,
          Realisasi:
            currentYearData["Semester 1"].Realisasi +
            currentYearData["Semester 2"].Realisasi,
        }
      : currentYearData[semester]

  const chartData = [
    {
      name: semester,
      Target: currentData.Target,
      Realisasi: currentData.Realisasi,
    },
  ]

  const percentage =
    currentData.Target > 0
      ? (currentData.Realisasi / currentData.Target) * 100
      : 0

  const formattedPercentage = percentage.toFixed(2) + "%"

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-0">
        <div>
          <CardTitle>Penyerapan AO</CardTitle>
          <CardDescription>
            {semester} - {tahun}
          </CardDescription>
        </div>

        <Select value={semester} onValueChange={(val) => setSemester(val as Semester)}>
          <SelectTrigger className="w-full sm:w-36">
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
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[260px] sm:max-w-[300px]"
        >
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
                          {semester}
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

      <CardFooter className="mt-[-80px] justify-center gap-4 pt-3 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-black" />
          <span>Realisasi :</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`realisasi-${tahun}-${semester}-${currentData.Realisasi}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="font-medium text-foreground"
            >
              {formatRupiah(currentData.Realisasi)}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-sm bg-neutral-400" />
          <span>Target :</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`target-${tahun}-${semester}-${currentData.Target}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="font-medium text-foreground"
            >
              {formatRupiah(currentData.Target)}
            </motion.span>
          </AnimatePresence>
        </div>
      </CardFooter>
    </Card>
  )
}
