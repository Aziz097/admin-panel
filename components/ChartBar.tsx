// app/components/ChartBar.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Chart, registerables, ChartOptions } from "chart.js";

Chart.register(...registerables);

// Tipe lokal untuk totals per divisi
interface DivisionTotal {
  divisionId: number;
  divisionName: string;
  totalValue: number;
}

interface Props {
  totals: DivisionTotal[];
}

const ChartBar: React.FC<Props> = ({ totals }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;

    const labels = totals.map((t) => t.divisionName);
    const values = totals.map((t) => t.totalValue);

    // Warna yang sama dengan summary card mid‐tones
    const bgColors = [
      "rgba(59,130,246,0.6)",  // biru
      "rgba(16,185,129,0.6)",  // hijau
      "rgba(168,85,247,0.6)",  // ungu
      "rgba(236,72,153,0.6)",  // pink
      "rgba(234,179,8,0.6)",   // kuning
    ];
    const borderColors = [
      "rgb(59,130,246)",
      "rgb(16,185,129)",
      "rgb(168,85,247)",
      "rgb(236,72,153)",
      "rgb(234,179,8)",
    ];

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Divisi" },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Total Nilai" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    };

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total KPI per Divisi",
            data: values,
            backgroundColor: bgColors.slice(0, values.length),
            borderColor: borderColors.slice(0, values.length),
            borderWidth: 1,
          },
        ],
      },
      options,
    });

    return () => {
      chart.destroy();
    };
  }, [totals]);

  return (
    <div className="w-full h-64">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ChartBar;
