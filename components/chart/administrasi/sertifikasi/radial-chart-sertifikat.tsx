"use client"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts"

export function RadialChartSertifikatTanah({
  value = 0, target = 4, bulan = "-", tahun = "2024"
}: {
  value?: number,
  target?: number,
  bulan?: string,
  tahun?: string
}) {
  const percent = target > 0 ? Math.round((value / target) * 100) : 0;
  const chartData = [
    { name: "Sertifikat", Target: 100, Realisasi: percent }
  ];
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="font-semibold text-base mb-1">Progress Sertifikasi</div>
      <RadialBarChart
        width={150}
        height={110}
        innerRadius={40}
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
                    {percent}%
                  </text>
                );
              }
              return null;
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="Realisasi"
          fill="#0a0a0a"
          stackId="a"
          cornerRadius={3}
        />
        <RadialBar
          dataKey="Target"
          fill="#e5e7eb"
          stackId="a"
          cornerRadius={3}
        />
      </RadialBarChart>
      <div className="mt-1 text-base"><b>{value}</b> / {target} sertifikat selesai</div>
    </div>
  )
}
