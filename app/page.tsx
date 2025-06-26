// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import CardSummary from "@/components/CardSummary";
import ChartLine from "@/components/ChartLine";
import ChartBar from "@/components/ChartBar";
import ChartPie from "@/components/ChartPie";
import TableKpi from "@/components/TableKpi";
import {
  divisions,
  kpiData,
  KpiDataItem,
  Division,
} from "@/lib/mockData";

export default function DashboardPage() {
  // 1. Filter state
  const [divs, setDivs] = useState<Division[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(6);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // 2. Filtered KPI entries and totals
  const [filteredData, setFilteredData] = useState<KpiDataItem[]>([]);
  const [summaryTotals, setSummaryTotals] = useState<
    { divisionId: number; divisionName: string; totalValue: number }[]
  >([]);

  // init divisions
  useEffect(() => {
    setDivs(divisions);
  }, []);

  // re-filter & re-aggregate on filter change
  useEffect(() => {
    // filter entries
    const fd = kpiData.filter((d) => {
      if (d.periodMonth !== selectedMonth || d.periodYear !== selectedYear)
        return false;
      if (selectedDivision && d.divisionId !== selectedDivision) return false;
      return true;
    });
    setFilteredData(fd);

    // aggregate totals
    const acc: Record<number, { divisionName: string; totalValue: number }> = {};
    fd.forEach((d) => {
      if (!acc[d.divisionId]) {
        acc[d.divisionId] = { divisionName: d.divisionName, totalValue: 0 };
      }
      acc[d.divisionId].totalValue += d.value;
    });
    setSummaryTotals(
      Object.entries(acc).map(([id, { divisionName, totalValue }]) => ({
        divisionId: Number(id),
        divisionName,
        totalValue,
      }))
    );
  }, [selectedDivision, selectedMonth, selectedYear]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Title */}
      <h1 className="text-2xl font-bold">
        Dashboard KPI Departemen Keuangan & Administrasi
      </h1>

      {/* Filter Panel */}
      <FilterPanel
        divisions={divs}
        selectedDivision={selectedDivision}
        onDivisionChange={setSelectedDivision}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {summaryTotals.length > 0 ? (
          summaryTotals.map((t, i) => (
            <CardSummary
              key={t.divisionId}
              title={t.divisionName}
              value={t.totalValue}
              unit=""
              colorIndex={i}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Tidak ada data untuk periode ini.
          </p>
        )}
      </div>


      {/* Trend Line Chart */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Trend KPI Per Bulan</h2>
        <ChartLine dataForLine={kpiData} />
      </div>

      {/* Bar & Pie Charts */}
      {/* Bar & Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart Panel */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col">
          <h3 className="text-lg font-semibold mb-3">
            Perbandingan KPI per Divisi
          </h3>
          <ChartBar totals={summaryTotals} />
        </div>

        {/* Pie Chart Panel */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Distribusi KPI</h3>
          <ChartPie
            data={summaryTotals.map((t) => ({
              divisionName: t.divisionName,
              value: t.totalValue,
            }))}
          />
        </div>
      </div>


      {/* Detail Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Detail Data KPI</h3>
        <TableKpi data={filteredData} />
      </div>
    </div>
  );
}
