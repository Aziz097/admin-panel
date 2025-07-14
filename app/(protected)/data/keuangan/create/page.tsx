"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";

export type KeuanganType = "optimasi" | "aki" | "ao" | "attb";

interface KeuanganRow {
  tahun: string;
  bulan?: string;
  semester?: string;
  kategori?: string;
  penetapan?: string;
  optimasi?: string;
  target?: string;
  realisasi?: string;
}

const KATEGORI_OPTIONS = [
  "Perjalanan Dinas Non Diklat",
  "Bahan Makanan & Konsumsi",
  "Alat dan Keperluan Kantor",
  "Barang Cetakan",
];

const EMPTY_ROW: KeuanganRow = {
  tahun: new Date().getFullYear().toString(),
  bulan: "",
  semester: "",
  kategori: "",
  penetapan: "",
  optimasi: "",
  target: "",
  realisasi: "",
};

function formatIDR(value: string): string {
  const num = value.replace(/\D/g, "");
  return num
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(parseInt(num, 10))
    : "";
}

function parseIDR(value: string): number {
  return Number(value.replace(/\D/g, ""));
}

export default function CreateKeuanganPage() {
  const router = useRouter();
  const [type, setType] = useState<KeuanganType>("optimasi");
  const [rows, setRows] = useState<KeuanganRow[]>([EMPTY_ROW]);
  const [existingData, setExistingData] = useState<KeuanganRow[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeFromURL = params.get("type") as KeuanganType;
    if (typeFromURL) setType(typeFromURL);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/keuangan?type=${type}`);
        const data = await res.json();
        if (res.ok) {
          setExistingData(data);
        } else {
          toast.error("Gagal memuat data.");
        }
      } catch (e) {
        console.error("Error fetching existing data:", e);
        toast.error("Gagal memuat data.");
      }
    };

    fetchData();
  }, [type]);

  const handleChange = (index: number, field: keyof KeuanganRow, value: string) => {
    const rawValue =
      ["penetapan", "optimasi", "target", "realisasi"].includes(field)
        ? value.replace(/\D/g, "")
        : value;

    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: rawValue } : row))
    );
  };

  const addRow = () => setRows([...rows, EMPTY_ROW]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      for (const row of rows) {
        let isDuplicate = false;

        if (type === "ao" || type === "attb") {
          isDuplicate = existingData.some(
            (existing) => existing.tahun === row.tahun && existing.semester === row.semester
          );
        } else {
          isDuplicate = existingData.some(
            (existing) => existing.tahun === row.tahun && existing.bulan === row.bulan
          );
        }

        if (isDuplicate) {
          toast.error(
            `Data untuk ${row.tahun} - ${
              type === "ao" || type === "attb" ? "Semester " + row.semester : row.bulan
            } sudah ada.`
          );
          return;
        }
      }

      const sanitizedRows = rows.map((r) => ({
        ...r,
        penetapan: r.penetapan ? parseIDR(r.penetapan) : undefined,
        optimasi: r.optimasi ? parseIDR(r.optimasi) : undefined,
        target: r.target ? parseIDR(r.target) : undefined,
        realisasi: r.realisasi ? parseIDR(r.realisasi) : undefined,
      }));

      const res = await fetch(`/api/keuangan?type=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedRows),
      });

      if (!res.ok) throw new Error("Gagal menambahkan data");

      toast.success("Data berhasil ditambahkan");
      router.push(`/data/keuangan?type=${type}`);
    } catch (e) {
      console.error("Submission error:", e);
      toast.error("Terjadi kesalahan saat menyimpan.");
    }
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="max-w-[90rem] md:mx-auto px-4 py-6 space-y-6 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 w-full sm:flex-row sm:items-center">
            <h1 className="text-2xl font-semibold">Tambah Data Keuangan</h1>
            <Select
              value={type}
              onValueChange={(val) => {
                setType(val as KeuanganType);
                setRows([EMPTY_ROW]);
              }}
            >
              <SelectTrigger className="w-full lg:w-[200px] cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 font-semibold">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimasi">Optimasi 5.4</SelectItem>
                <SelectItem value="aki">Disburse AKI</SelectItem>
                <SelectItem value="ao">Penyerapan AO</SelectItem>
                <SelectItem value="attb">Penarikan ATTB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rows.map((form, index) => (
            <Card key={index} className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
              <div className="space-y-4">
                <div className="w-full">
                  <Label>Tahun</Label>
                  <Input
                    type="number"
                    value={form.tahun}
                    onChange={(e) => handleChange(index, "tahun", e.target.value)}
                    placeholder="Tahun"
                  />
                </div>

                {type === "aki" && (
                  <div className="w-full">
                    <Label>Bulan</Label>
                    <Select
                      value={form.bulan}
                      onValueChange={(val) => handleChange(index, "bulan", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Januari",
                          "Februari",
                          "Maret",
                          "April",
                          "Mei",
                          "Juni",
                          "Juli",
                          "Agustus",
                          "September",
                          "Oktober",
                          "November",
                          "Desember",
                        ].map((bulan) => (
                          <SelectItem key={bulan} value={bulan}>
                            {bulan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {type === "optimasi" && (
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full md:w-[140px]">
                      <Label>Bulan</Label>
                      <Select
                        value={form.bulan}
                        onValueChange={(val) => handleChange(index, "bulan", val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Januari",
                            "Februari",
                            "Maret",
                            "April",
                            "Mei",
                            "Juni",
                            "Juli",
                            "Agustus",
                            "September",
                            "Oktober",
                            "November",
                            "Desember",
                          ].map((bulan) => (
                            <SelectItem key={bulan} value={bulan}>
                              {bulan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label>Kategori</Label>
                      <Select
                        value={form.kategori}
                        onValueChange={(val) => handleChange(index, "kategori", val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {KATEGORI_OPTIONS.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(type === "ao" || type === "attb") && (
                  <div className="w-full">
                    <Label>Semester</Label>
                    <Select
                      value={form.semester}
                      onValueChange={(val) => handleChange(index, "semester", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {type === "optimasi" && (
                  <>
                    <div className="w-full">
                      <Label>Penetapan</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatIDR(form.penetapan || "")}
                        onChange={(e) =>
                          handleChange(index, "penetapan", e.target.value)
                        }
                        placeholder="Masukkan jumlah penetapan"
                      />
                    </div>
                    <div className="w-full">
                      <Label>Optimasi (Opsional)</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatIDR(form.optimasi || "")}
                        onChange={(e) =>
                          handleChange(index, "optimasi", e.target.value)
                        }
                        placeholder="Masukkan jumlah optimasi"
                      />
                    </div>
                  </>
                )}

                {type !== "optimasi" && (
                  <div className="w-full">
                    <Label>Target</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatIDR(form.target || "")}
                      onChange={(e) =>
                        handleChange(index, "target", e.target.value)
                      }
                      placeholder="Masukkan jumlah target"
                    />
                  </div>
                )}

                <div className="w-full">
                  <Label>Realisasi (Opsional)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatIDR(form.realisasi || "")}
                    onChange={(e) =>
                      handleChange(index, "realisasi", e.target.value)
                    }
                    placeholder="Masukkan jumlah realisasi"
                  />
                </div>

                {rows.length > 1 && (
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="w-full sm:w-auto"
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push(`/data/keuangan?type=${type}`)}
            >
              Kembali
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <Button variant="outline" onClick={addRow}>
                + Tambah Baris
              </Button>
              <Button
                className="bg-sky-400 hover:bg-sky-500 text-white"
                onClick={handleSubmit}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
