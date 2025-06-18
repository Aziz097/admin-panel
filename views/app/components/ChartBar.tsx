// app/components/ChartBar.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { KpiTotal } from "../../lib/mockData";

Chart.register(...registerables);

interface Props {
  totals: KpiTotal[];
}

const ChartBar: React.FC<Props> = ({ totals }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;

    const labels = totals.map((t) => t.divisionName);
    const values = totals.map((t) => t.totalValue);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total KPI per Divisi",
            data: values,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: { enabled: true },
        },
        scales: {
          x: { display: true, title: { display: true, text: "Divisi" } },
          y: { display: true, title: { display: true, text: "Total Nilai" } },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [totals]);

  return <canvas ref={canvasRef}></canvas>;
};

export default ChartBar;
