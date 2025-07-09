"use client"
import { Card } from "@/components/ui/card"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts"

export function CardAkunInfluencer({
  value = 1,
  target = 4,
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
    { name: "Akun", Target: 100, Realisasi: percent }
  ];

  return (
    <Card className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-none flex flex-col min-h-[220px] relative">
      <div>
        <div className="font-bold text-lg text-black mb-1">Akun Influencer Aktif</div>
        <div className="text-sm text-zinc-500 mb-2">
          {bulan} - {tahun}
        </div>
      </div>
      <div className="flex w-full justify-between items-center flex-1">
      <div className ="mt-6 items-baseline gap-1">
          <span className="text-4xl font-extrabold text-black">{value}</span>
          <span className="text-2xl font-bold text-zinc-400">/ {target}</span>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex flex-col items-center overflow-visible [&_*]:focus:outline-none">
            <RadialBarChart
              width={120}
              height={95}
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
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="Target"
                fill="#e5e7eb"
                stackId="a"
                cornerRadius={3}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </div>
        </div>
      </div>
    </Card>
  )
}
