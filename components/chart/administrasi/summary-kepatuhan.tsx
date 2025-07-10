"use client";
import { useState } from "react";
import { KepatuhanWrapper } from "./kepatuhan/kepatuhan-wrapper";
import { TableKepatuhan } from "./kepatuhan/table-kepatuhan";
import { ChartBarStackedKepatuhan } from "./kepatuhan/chart-kepatuhan";

const rawData = {
  "06": [
    { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 3 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 1 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 2 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
    { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 3 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 1 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 2 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
    { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 3 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 1 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 2 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
  ],
  "07": [
    { indikator: "Dokumen A", kategori: "Pemenuhan", eviden: 3, patuh: 2 },
    { indikator: "Dokumen B", kategori: "Kualitas", eviden: 2, patuh: 2 },
    { indikator: "Dokumen C", kategori: "Pemenuhan", eviden: 2, patuh: 1 },
    { indikator: "Dokumen D", kategori: "Kualitas", eviden: 1, patuh: 1 },
  ]
};

const bulanList = [
  { label: "Januari", value: "01" },
  { label: "Februari", value: "02" },
  { label: "Maret", value: "03" },
  { label: "April", value: "04" },
  { label: "Mei", value: "05" },
  { label: "Juni", value: "06" },
  { label: "Juli", value: "07" },
  { label: "Agustus", value: "08" },
  { label: "September", value: "09" },
  { label: "Oktober", value: "10" },
  { label: "November", value: "11" },
  { label: "Desember", value: "12" },
];

export function SummaryKepatuhan() {
  const [bulan, setBulan] = useState("06");
  const data = rawData[bulan] || [];
  const labelBulan = bulanList.find(b => b.value === bulan)?.label ?? "-";

  return (
    <KepatuhanWrapper
      bulan={bulan}
      setBulan={setBulan}
      labelBulan={labelBulan}
    >
      <TableKepatuhan data={data} />
      <ChartBarStackedKepatuhan bulan={bulan} />
    </KepatuhanWrapper>
  );
}