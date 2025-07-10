"use client";
import { useState } from "react";
import { SertifikasiTanahWrapper } from "./sertifikasi/sertifikasi-tanah-wrapper";
import { TableSertifikatTanah } from "./sertifikasi/table-sertifikat-tanah";
import { RadialChartSertifikatTanah } from "./sertifikasi/radial-chart-sertifikat";

// Dummy data, index by bulan (bisa kamu ganti dengan API/fetch ke depannya)
const sertifikatRaw = {
  "06": [
    { no: "001", nama: "Sertifikat A", status: "Selesai", keterangan: "Sudah diverifikasi" },
    { no: "002", nama: "Sertifikat B", status: "Proses", keterangan: "Menunggu dokumen" },
    { no: "003", nama: "Sertifikat C", status: "Belum Mulai", keterangan: "" },
    { no: "004", nama: "Sertifikat D", status: "Selesai", keterangan: "" }
  ],
  "07": [
    { no: "005", nama: "Sertifikat E", status: "Selesai", keterangan: "Sudah dicetak" },
    { no: "006", nama: "Sertifikat F", status: "Proses", keterangan: "" }
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

export function TableSertifikasi() {
  const [bulan, setBulan] = useState("06");
  const data = sertifikatRaw[bulan] ?? [];
  const labelBulan = bulanList.find(b => b.value === bulan)?.label ?? "-";
  const target = 4; // target sertifikat selesai per bulan
  const totalSelesai = data.filter(x => x.status === "Selesai").length;

  return (
    <SertifikasiTanahWrapper
      bulan={bulan}
      setBulan={setBulan}
      labelBulan={labelBulan}
    >
      <TableSertifikatTanah data={data} />
      <RadialChartSertifikatTanah
        value={totalSelesai}
        target={target}
        bulan={labelBulan}
        tahun="2024"
      />
    </SertifikasiTanahWrapper>
  );
}