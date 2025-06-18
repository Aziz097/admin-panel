// app/components/ChartLine.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Chart, registerables, ChartOptions } from "chart.js";
import { KpiDataItem } from "../../lib/mockData";

// Fungsi membantu: agar key bulanan terurut dengan format "YYYY-MM"
function formatPeriod(d: KpiDataItem): string {
  const mm = String(d.periodMonth).padStart(2, "0");
  return `${d.periodYear}-${mm}`;
}

interface Props {
  dataForLine: KpiDataItem[]; 
}

const ChartLine: React.FC<Props> = ({ dataForLine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;

    // 1. Grouping data per bulan‐tahun (YYYY-MM)
    type SumCount = { sum: number; count: number };
    const sumCount: Record<string, SumCount> = {};

    dataForLine.forEach((d) => {
      const key = formatPeriod(d); // misal "2025-05", "2025-06", "2025-07"
      if (!sumCount[key]) sumCount[key] = { sum: 0, count: 0 };
      sumCount[key].sum += d.value;
      sumCount[key].count += 1;
    });

    // 2. Susun labels (periode) dan values (rata‐rata)
    const labels = Object.keys(sumCount).sort();
    const values = labels.map((k) => sumCount[k].sum / sumCount[k].count);

    // Debug:
    console.log("ChartLine Bulanan → labels:", labels, " values:", values);

    // 3. Jika tidak ada data, hentikan
    if (labels.length === 0) return;

    // 4. Buat ChartJS
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Rata‐rata Nilai KPI (Bulanan)",
            data: values,
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            borderColor: "rgb(37, 99, 235)",           // biru (Tailwind blue-600)
            backgroundColor: "rgba(37, 99, 235, 0.2)", // fill biru transparan
            pointBackgroundColor: "rgb(37, 99, 235)",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { enabled: true },
          legend: {
            display: true,
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: "rectRounded",
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: { display: true, text: "Periode (YYYY-MM)" },
          },
          y: {
            display: true,
            beginAtZero: true,
            title: { display: true, text: "Nilai" },
          },
        },
      } as ChartOptions<"line">,
    });

    return () => {
      chart.destroy();
    };
  }, [dataForLine]);

  return (
    // Bungkus canvas dengan div agar tingginya konstan (misal 300px)
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default ChartLine;
