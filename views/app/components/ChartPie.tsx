// app/components/ChartPie.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Chart, registerables, ChartOptions } from "chart.js";

Chart.register(...registerables);

interface Props {
  data: { divisionName: string; value: number }[];
}

export default function ChartPie({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;

    // 1) Aggregate per division
    const sums: Record<string, number> = {};
    data.forEach(({ divisionName, value }) => {
      sums[divisionName] = (sums[divisionName] || 0) + value;
    });
    const labels = Object.keys(sums);
    const values = Object.values(sums);

    // 2) Use the same mid-tones as your summary cards
    const bgColors = [
      "rgba(59,130,246,0.6)",   // blue-500
      "rgba(16,185,129,0.6)",   // green-500
      "rgba(168,85,247,0.6)",   // purple-500
      "rgba(236,72,153,0.6)",   // pink-500
      "rgba(234,179,8,0.6)",    // yellow-500
    ];
    const borderColors = [
      "rgb(59,130,246)",
      "rgb(16,185,129)",
      "rgb(168,85,247)",
      "rgb(236,72,153)",
      "rgb(234,179,8)",
    ];

    // 3) Chart.js options with tighter legend
    const options: ChartOptions<"pie"> = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      layout: {
        padding: {
          right: 100,       // remove extra right padding
        },
      },
      plugins: {
        legend: {
          position: "right",
          align: "center",
          labels: {
            boxWidth: 12,
            padding: 10,    // smaller gap between icon and text
            font: { size: 12 },
          },
        },
        tooltip: { enabled: true },
      },
    };

    // 4) Create chart
    const chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors.slice(0, values.length),
            borderColor: borderColors.slice(0, values.length),
            borderWidth: 1,
            hoverOffset: 15,  // slice pops out on hover
          },
        ],
      },
      options,
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div className="w-full h-64">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
