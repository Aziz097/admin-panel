"use client"
import { Card } from "@/components/ui/card"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts"

export function CardScoringPublikasi({
  value = 1575000,
  target = 2250000,
  bulan = "Juni",
  tahun = "2024",
}: {
  value?: number
  target?: number
  bulan?: string
  tahun?: string
}) {
  const percent = (value / target) * 100
  const chartData = [
    { name: "Publikasi", Target: 100, Realisasi: percent }
  ];

  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-none flex flex-col min-h-[220px] relative">
      <div>
        <div className="font-bold text-lg text-black mb-1">Scoring Publikasi</div>
        <div className="text-sm text-zinc-500 mb-2">{bulan} - {tahun}</div>
      </div>
      <div className="flex w-full justify-between items-center flex-1">
        {/* Nominal */}
        <div className="flex-1 flex items-end">
          <span className="text-base font-bold text-black">
            Rp {value.toLocaleString()}
          </span>
        </div>
        {/* Chart */}
        <div className="flex items-center justify-end">
          <div className="flex flex-col items-center overflow-visible [&_*]:focus:outline-none">
            <RadialBarChart
              width={120}
              height={100}
              innerRadius={42}
              outerRadius={55}
              startAngle={180}
              endAngle={0}
              data={chartData}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              style={{ overflow: "visible" }}
            >
              <PolarRadiusAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
                tickLine={false}
              >
                <Label
                  position="insideBottom"
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          fontWeight={700}
                          fontSize={20}
                          fill="#222"
                          dy={10}
                        >
                          {Math.round(percent)}%
                        </text>
                      )
                    }
                    return null
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="Realisasi"
                fill="#222"
                stackId="a"
                cornerRadius={3}
                background
              />
              <RadialBar
                dataKey="Target"
                fill="#e5e7eb"
                stackId="a"
                cornerRadius={3}
              />
            </RadialBarChart>
          </div>
        </div>
      </div>
    </Card>
  )
}
