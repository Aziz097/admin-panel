"use client"

import * as React from "react"
import { Label, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

// --- Type Definitions ---
type SemesterFilter = "Semester 1" | "Semester 2" | "Akumulasi"
type ChartData = {
    target: number
    realisasi: number
}

interface ChartRadialTjslProps {
    loading: boolean
    chartData: ChartData
    tahun: string
    semester: SemesterFilter
    setSemester: React.Dispatch<React.SetStateAction<SemesterFilter>>
}

const chartConfig = {
    target: { label: "Target" },
    realisasi: { label: "Realisasi", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

// --- Main Component ---
export function ChartRadialTjsl({ loading, chartData, tahun, semester, setSemester }: ChartRadialTjslProps) {
    
    // Skeleton UI saat data sedang dimuat
    if (loading) {
        return (
            <div className="w-full">
                <div className="flex flex-col items-center">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-9 w-48" />
                </div>
                <div className="flex justify-center items-center h-[150px] mt-4">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <div className="flex w-full justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4" /></div>
                    <div className="flex w-full justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4" /></div>
                </div>
            </div>
        )
    }

    const sisa = chartData.target - chartData.realisasi;
    
    // Data untuk Recharts, dipecah menjadi realisasi dan sisa
    const chartDisplayData = [{
        name: semester,
        realisasi: chartData.realisasi,
        sisa: sisa > 0 ? sisa : 0, // Sisa tidak boleh negatif
    }];

    const percentage =
        chartData.target > 0
            ? (chartData.realisasi / chartData.target) * 100
            : 0
    const formattedPercentage = percentage.toFixed(2) + "%"

    return (
        <div className="w-full">
            <div className="flex flex-col items-center">
                 <h3 className="font-semibold mb-2">Capaian Partisipasi</h3>
                 <Select value={semester} onValueChange={(val) => setSemester(val as SemesterFilter)}>
                    <SelectTrigger className="w-[180px] mt-2 mb-27">
                        <SelectValue placeholder="Pilih Periode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semester 1">Semester 1</SelectItem>
                        <SelectItem value="Semester 2">Semester 2</SelectItem>
                        <SelectItem value="Akumulasi">Akumulasi</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex-1 flex items-center pb-0 mt-4 h-[150px]">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
                    <RadialBarChart
                        data={chartDisplayData}
                        startAngle={180}
                        endAngle={0}
                        innerRadius={100}
                        outerRadius={150}
                        barSize={40}
                    >

                        <PolarAngleAxis type="number" domain={[0, chartData.target]} tick={false} />
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
                            dataKey="realisasi"
                            stackId="a"
                            cornerRadius={6}
                            fill="rgb(14, 165, 233)"
                            className="stroke-transparent stroke-2"
                        />
                        {/* Bar untuk Sisa Target (abu-abu) */}
                        <RadialBar
                            dataKey="sisa"
                            stackId="a"
                            cornerRadius={6}
                            fill="rgb(186, 230, 253)"
                            className="stroke-transparent stroke-2"
                        />
                        
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 10} className="fill-foreground text-3xl font-bold">
                                                {percentage.toFixed(1)}%
                                            </tspan>
                                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 15} className="fill-muted-foreground text-sm">
                                                Partisipasi
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </div>
            <div className="flex-col gap-2 text-sm mt-4">
                <div className="flex items-center justify-between w-full border-t pt-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500"/>
                        <div className="text-muted-foreground">Realisasi</div>
                    </div>
                    <div className="font-medium">{chartData.realisasi} Partisipasi</div>
                </div>
                <div className="flex items-center justify-between w-full border-t pt-2 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-200" />
                        <div className="text-muted-foreground">Target</div>
                    </div>
                    <div className="font-medium">{chartData.target} Partisipasi</div>
                </div>
            </div>
        </div>
    )
}
