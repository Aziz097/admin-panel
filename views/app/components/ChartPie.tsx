// app/components/ChartPie.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { KpiDataItem } from "../../lib/mockData";

Chart.register(...registerables);

interface Props {
  data: KpiDataItem[];
}

const ChartPie: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;

    const sumPerDiv: Record<string, number> = {};
    data.forEach((d) => {
      if (!sumPerDiv[d.divisionName]) sumPerDiv[d.divisionName] = 0;
      sumPerDiv[d.divisionName] += d.value;
    });

    const labels = Object.keys(sumPerDiv);
    const values = Object.values(sumPerDiv);

    const chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
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
      },
    });

    return () => {
      chart.destroy();
    };
  }, [data]);

  return <canvas ref={canvasRef}></canvas>;
};

export default ChartPie;
