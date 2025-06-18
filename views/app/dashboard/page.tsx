// app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import FilterPanel from "../components/FilterPanel";
import CardSummary from "../components/CardSummary";
import ChartLine from "../components/ChartLine";
import ChartBar from "../components/ChartBar";
import ChartPie from "../components/ChartPie";
import TableKpi from "../components/TableKpi";

import {
  divisions as allDivisions,
  KpiDataItem,
  kpiData as allKpiData, // seluruh data dummy
  KpiTotal,
  kpiTotals as allKpiTotals,
  Division,
} from "../../lib/mockData";

export default function DashboardPage() {
  // --- State untuk filter dropdown ---
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // default 6 supaya ada data
  const [selectedYear, setSelectedYear] = useState<number>(2025); // default 2025

  // --- State untuk data yang ter‐filter (KPI card, bar, pie, table) ---
  const [kpiDataFiltered, setKpiDataFiltered] = useState<KpiDataItem[]>([]);
  const [kpiTotalsFiltered, setKpiTotalsFiltered] = useState<KpiTotal[]>([]);

  // Inisialisasi daftar divisi
  useEffect(() => {
    setDivisions(allDivisions);
  }, []);

  // Jalankan filter setiap kali dropdown berubah
  useEffect(() => {
    // 1. Filter kpiData berdasarkan selectedMonth, selectedYear, selectedDivision
    const filtered = allKpiData.filter((d) => {
      if (d.periodMonth !== selectedMonth || d.periodYear !== selectedYear) {
        return false;
      }
      if (selectedDivision && d.divisionId !== selectedDivision) {
        return false;
      }
      return true;
    });
    setKpiDataFiltered(filtered);

    // 2. Filter kpiTotals (card ringkasan) berdasarkan selectedDivision
    const filteredTotals = allKpiTotals.filter((t) => t.totalValue > 0);
    const finalTotals = selectedDivision
      ? filteredTotals.filter((t) => t.divisionId === selectedDivision)
      : filteredTotals;
    setKpiTotalsFiltered(finalTotals);
  }, [selectedDivision, selectedMonth, selectedYear]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard KPI Departemen Keuangan & Administrasi
      </h1>

      {/* Filter Panel (Divisi, Bulan, Tahun) */}
      <FilterPanel
        divisions={divisions}
        selectedDivision={selectedDivision}
        onDivisionChange={setSelectedDivision}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* 1. Line Chart Bulanan (tidak terpengaruh filter) */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h2 className="text-lg font-semibold mb-2">Trend KPI Per Bulan</h2>
        <ChartLine dataForLine={allKpiData} />
      </div>

      {/* 2. Ringkasan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {kpiTotalsFiltered.length > 0 ? (
          kpiTotalsFiltered.map((t) => (
            <CardSummary
              key={t.divisionId}
              title={t.divisionName}
              value={t.totalValue}
              unit="(total)"
            />
          ))
        ) : (
          <p className="col-span-4 text-center text-gray-500">
            Tidak ada data untuk periode ini.
          </p>
        )}
      </div>

      {/* 3. Bar & Pie Charts + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Bar chart: perbandingan KPI per divisi */}
        <div className="bg-white p-4 rounded-xl shadow h-[350px]">
          <h2 className="text-lg font-semibold mb-2">
            Perbandingan KPI Antara Divisi (Periode Terpilih)
          </h2>
          <ChartBar totals={kpiTotalsFiltered} />
        </div>

        {/* Pie chart: distribusi KPI */}
        <div className="bg-white p-4 rounded-xl shadow h-[350px]">
          <h2 className="text-lg font-semibold mb-2">
            Distribusi KPI (Periode Terpilih)
          </h2>
          <ChartPie data={kpiDataFiltered} />
        </div>

        {/* Table KPI */}
        <div className="bg-white p-4 rounded-xl shadow col-span-2">
          <h2 className="text-lg font-semibold mb-2">Detail Data KPI</h2>
          <TableKpi data={kpiDataFiltered} />
        </div>
      </div>
    </div>
  );
}
