// app/components/FilterPanel.tsx
"use client";

import React from "react";
import { Division } from "../lib/mockData";

interface Props {
  divisions: Division[];
  selectedDivision: number | null;
  onDivisionChange: (id: number | null) => void;
  selectedMonth: number;
  onMonthChange: (m: number) => void;
  selectedYear: number;
  onYearChange: (y: number) => void;
}

const FilterPanel: React.FC<Props> = ({
  divisions,
  selectedDivision,
  onDivisionChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div>
        <label className="block text-sm font-medium">Divisi</label>
        <select
          className="mt-1 block w-full border rounded p-2"
          value={selectedDivision ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onDivisionChange(val ? Number(val) : null);
          }}
        >
          <option value="">Semua Divisi</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Bulan</label>
        <select
          className="mt-1 block w-full border rounded p-2"
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Tahun</label>
        <select
          className="mt-1 block w-full border rounded p-2"
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
