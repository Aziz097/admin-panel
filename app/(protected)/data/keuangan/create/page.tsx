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

const KATEGORI_OPTIONS = [
  "Perjalanan Dinas Non Diklat",
  "Bahan Makanan & Konsumsi",
  "Alat dan Keperluan Kantor",
  "Barang Cetakan",
];

const EMPTY_ROW = {
  tahun: new Date().getFullYear().toString(),
  bulan: "",
  semester: "",
  kategori: "",
  penetapan: "",
  optimasi: "",
  target: "",
  realisasi: "",
};

function formatRupiah(value: string): string {
  const numberString = value.replace(/[^\d,]/g, "").replace(",", ".");
  const parts = numberString.split(".");
  const integerPart = parts[0].replace(/^0+/, "") || "0";
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.length > 1 ? `${formattedInt},${parts[1]}` : formattedInt;
}

function parseRupiah(value: string): number {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

export default function CreateKeuanganPage() {
  const router = useRouter();
  const [type, setType] = useState<KeuanganType>("optimasi");
  const [rows, setRows] = useState<any[]>([EMPTY_ROW]);
  const [existingData, setExistingData] = useState<any[]>([]); // Store existing data

  // Load type from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeFromURL = params.get("type") as KeuanganType;
    if (typeFromURL) setType(typeFromURL);
  }, []);

  // Fetch existing data from backend when component loads
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
      } catch (error) {
        console.error("Error fetching existing data:", error);
        toast.error("Gagal memuat data.");
      }
    };

    fetchData();
  }, [type]);

  const handleChange = (index: number, field: string, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows([...rows, EMPTY_ROW]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      for (const row of rows) {
        // Check for duplicates based on type
        let isDuplicate = false;
        if (type === "ao" || type === "attb") {
          // Check for duplicate based on tahun and semester
          isDuplicate = existingData.some(
            (existing) => existing.tahun === row.tahun && existing.semester === row.semester
          );
        } else {
          // Check for duplicate based on tahun and bulan
          isDuplicate = existingData.some(
            (existing) => existing.tahun === row.tahun && existing.bulan === row.bulan
          );
        }

        if (isDuplicate) {
          toast.error(
            `Data untuk ${row.tahun} - ${type === "ao" || type === "attb" ? 'Semester ' + row.semester : row.bulan} sudah ada.`
          );
          return; // Prevent submission if duplicate found
        }
      }

      const sanitizedRows = rows.map((r) => ({
        ...r,
        penetapan: r.penetapan ? parseRupiah(r.penetapan) : undefined,
        optimasi: r.optimasi ? parseRupiah(r.optimasi) : undefined,
        target: r.target ? parseRupiah(r.target) : undefined,
        realisasi: r.realisasi ? parseRupiah(r.realisasi) : undefined,
      }));

      const res = await fetch(`/api/keuangan?type=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedRows),
      });

      if (!res.ok) throw new Error("Gagal menambahkan data");

      toast.success("Data berhasil ditambahkan");
      router.push(`/data/keuangan?type=${type}`);
    } catch (error) {
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
                <SelectItem value="optimasi" className="cursor-pointer">Optimasi 5.4</SelectItem>
                <SelectItem value="aki" className="cursor-pointer">Disburse AKI</SelectItem>
                <SelectItem value="ao" className="cursor-pointer">Penyerapan AO</SelectItem>
                <SelectItem value="attb" className="cursor-pointer">Penarikan ATTB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rows.map((form, index) => (
            <Card key={index} className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
              <div className="space-y-4">
                <div className="w-full">
                  <Label className="mb-1">Tahun</Label>
                  <Input
                    type="number"
                    value={form.tahun}
                    onChange={(e) => handleChange(index, "tahun", e.target.value)}
                    placeholder="Tahun"
                    className="cursor-text"
                  />
                </div>

                {type === "aki" && (
                  <div className="w-full">
                    <Label className="mb-1">Bulan</Label>
                    <Select
                      value={form.bulan}
                      onValueChange={(val) => handleChange(index, "bulan", val)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Pilih Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {[ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((bulan) => (
                          <SelectItem key={bulan} value={bulan} className="cursor-pointer">
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
                      <Label className="mb-1">Bulan</Label>
                      <Select
                        value={form.bulan}
                        onValueChange={(val) => handleChange(index, "bulan", val)}
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((bulan) => (
                            <SelectItem key={bulan} value={bulan} className="cursor-pointer">
                              {bulan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <Label className="mb-1">Kategori</Label>
                      <Select
                        value={form.kategori}
                        onValueChange={(val) => handleChange(index, "kategori", val)}
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {KATEGORI_OPTIONS.map((k) => (
                            <SelectItem key={k} value={k} className="cursor-pointer">
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
                    <Label className="mb-1">Semester</Label>
                    <Select
                      value={form.semester}
                      onValueChange={(val) => handleChange(index, "semester", val)}
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="cursor-pointer">1</SelectItem>
                        <SelectItem value="2" className="cursor-pointer">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {type === "optimasi" && (
                  <>
                    <div className="w-full">
                      <Label className="mb-1">Penetapan</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatRupiah(form.penetapan)}
                        onChange={(e) =>
                          handleChange(index, "penetapan", e.target.value)
                        }
                        placeholder="Masukkan jumlah penetapan"
                        className="cursor-text"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-1">Optimasi (Opsional)</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formatRupiah(form.optimasi)}
                        onChange={(e) =>
                          handleChange(index, "optimasi", e.target.value)
                        }
                        placeholder="Masukkan jumlah optimasi"
                        className="cursor-text"
                      />
                    </div>
                  </>
                )}

                {type !== "optimasi" && (
                  <div className="w-full">
                    <Label className="mb-1">Target</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatRupiah(form.target)}
                      onChange={(e) =>
                        handleChange(index, "target", e.target.value)
                      }
                      placeholder="Masukkan jumlah target"
                      className="cursor-text"
                    />
                  </div>
                )}

                <div className="w-full">
                  <Label className="mb-1">Realisasi (Opsional)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(form.realisasi)}
                    onChange={(e) =>
                      handleChange(index, "realisasi", e.target.value)
                    }
                    placeholder="Masukkan jumlah realisasi"
                    className="cursor-text"
                  />
                </div>

                {rows.length > 1 && (
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="w-full sm:w-auto cursor-pointer"
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
              className="w-full sm:w-auto cursor-pointer"
              onClick={() => router.push(`/data/keuangan?type=${type}`)}
            >
              Kembali
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto cursor-pointer"
                onClick={addRow}
              >
                + Tambah Baris
              </Button>
              <Button
                className="w-full bg-sky-400 hover:bg-sky-600 sm:w-auto mt-2 sm:mt-0 cursor-pointer"
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
