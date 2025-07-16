"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { IconTrash } from "@tabler/icons-react";

// **DIUBAH**: Menghapus 'tjsl' dan menambahkan 'ocr'
export type AdministrasiType = "komunikasi" | "sertifikasi" | "kepatuhan" | "ocr";

const INDIKATOR_KOMUNIKASI_OPTIONS = [
  "Release Berita",
  "Konten Foto",
  "Akun Influencer Aktif",
  "Share Berita Internal",
  "Scoring Publikasi",
  "Laporan Permintaan Publik",
];

// **BARU**: Opsi untuk Kategori OCR
const KATEGORI_OCR_OPTIONS = ["KC", "COP", "KS", "Inovasi"];

// **DIUBAH**: Menghapus field tjsl dan menambahkan field ocr
const EMPTY_ROW = {
  tahun: new Date().getFullYear().toString(), // Preload current year
  bulan: "",
  semester: "",
  keterangan: "",
  // Komunikasi
  namaIndikator: "",
  target: "",
  realisasi: "",
  // Sertifikasi
  nomor: "",
  nama: "",
  status: "",
  // Kepatuhan
  indikator: "",
  kategori: "",
  // OCR
  kategoriOCR: "",
};

function formatIDR(value: string): string {
  const num = value.replace(/\D/g, ""); // hapus semua karakter non-digit
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseInt(num || "0"));
}

// --- Split into Suspense wrapper + InnerForm client component ---
export default function CreateAdministrasiPage() {
  return (
    <Suspense fallback={<div>Loading form…</div>}>
      <InnerForm />
    </Suspense>
  );
}

function InnerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<AdministrasiType>("komunikasi");
  type RowData = typeof EMPTY_ROW;
  const [rows, setRows] = useState<RowData[]>([EMPTY_ROW]);

  useEffect(() => {
    const typeFromURL = searchParams.get("type") as AdministrasiType;
    if (
      typeFromURL &&
      ["komunikasi", "sertifikasi", "kepatuhan", "ocr"].includes(typeFromURL)
    ) {
      setType(typeFromURL);
    }
  }, [searchParams]);

  const handleChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setRows([...rows, EMPTY_ROW]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      const sanitizedRows = rows.map((r) => {
        const commonData = { tahun: r.tahun, bulan: r.bulan };
        switch (type) {
          case "komunikasi":
            return {
              ...commonData,
              namaIndikator: r.namaIndikator,
              target: parseInt(r.target, 10) || 0,
              realisasi: r.realisasi ? parseInt(r.realisasi, 10) : null,
            };
          case "sertifikasi":
            return {
              ...commonData,
              nomor: r.nomor,
              nama: r.nama,
              status: r.status,
              keterangan: r.keterangan,
            };
          case "kepatuhan":
            return {
              ...commonData,
              indikator: r.indikator,
              kategori: r.kategori,
              target: parseInt(r.target, 10) || 0,
              realisasi: r.realisasi ? parseInt(r.realisasi, 10) : null,
              keterangan: r.keterangan || null,
            };
          case "ocr":
            return {
              tahun: r.tahun,
              semester: r.semester,
              kategoriOCR: r.kategoriOCR,
              target: parseInt(r.target, 10) || 0,
              realisasi: r.realisasi ? parseInt(r.realisasi, 10) : null,
            };
          default:
            return {};
        }
      });

      const res = await fetch(`/api/administrasi?type=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedRows),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menambahkan data");
      }

      toast.success("Data berhasil ditambahkan");
      router.push(`/data/administrasi?type=${type}`);
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Terjadi kesalahan saat menyimpan.");
    }
  };

  const getMonthName = (monthNum: string): string => {
    if (!monthNum) return "";
    return new Date(0, parseInt(monthNum) - 1).toLocaleString("id-ID", {
      month: "long",
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="max-w-[90rem] md:mx-auto px-4 py-6 space-y-6 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 w-full sm:flex-row sm:items-center">
            <h1 className="text-2xl font-semibold">Tambah Data Administrasi</h1>
            <Select
              value={type}
              onValueChange={(val) => {
                setType(val as AdministrasiType);
                setRows([EMPTY_ROW]);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-[220px] cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 font-semibold"
                size="sm"
              >
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="komunikasi">Komunikasi</SelectItem>
                <SelectItem value="sertifikasi">Sertifikasi Tanah</SelectItem>
                <SelectItem value="kepatuhan">Kepatuhan</SelectItem>
                <SelectItem value="ocr">OCR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rows.map((form, index) => (
            <Card key={index} className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- Common Fields --- */}
                <div className="w-full">
                  <Label className="mb-1 block">Tahun</Label>
                  <Input
                    type="number"
                    value={form.tahun}
                    onChange={(e) => handleChange(index, "tahun", e.target.value)}
                    placeholder="Masukan Tahun"
                    className="w-full"
                  />
                </div>

                {/* **DIUBAH**: Menampilkan Bulan atau Semester secara kondisional */}
                {type !== "ocr" ? (
                  <div className="w-full">
                    <Label className="mb-1 block">Bulan</Label>
                    <Select
                      value={form.bulan}
                      onValueChange={(val) => handleChange(index, "bulan", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "01",
                          "02",
                          "03",
                          "04",
                          "05",
                          "06",
                          "07",
                          "08",
                          "09",
                          "10",
                          "11",
                          "12",
                        ].map((b) => (
                          <SelectItem key={b} value={b}>
                            {getMonthName(b)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="w-full">
                    <Label className="mb-1 block">Semester</Label>
                    <Select
                      value={form.semester}
                      onValueChange={(val) => handleChange(index, "semester", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* --- Dynamic Fields based on Type --- */}
                {type === "komunikasi" && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Nama Indikator</Label>
                      <Select
                        value={form.namaIndikator}
                        onValueChange={(val) => handleChange(index, "namaIndikator", val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Nama Indikator" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIKATOR_KOMUNIKASI_OPTIONS.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <Label className="mb-1 block">Target</Label>
                      <Input
                        type="text"
                        value={
                          form.namaIndikator === "Scoring Publikasi"
                            ? formatIDR(form.target)
                            : form.target
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "target",
                            form.namaIndikator === "Scoring Publikasi"
                              ? e.target.value.replace(/\D/g, "")
                              : e.target.value
                          )
                        }
                        placeholder="Jumlah Target"
                        className="w-full"
                      />
                    </div>

                    <div className="w-full">
                      <Label className="mb-1 block">Realisasi</Label>
                      <Input
                        type="text"
                        value={
                          form.namaIndikator === "Scoring Publikasi"
                            ? formatIDR(form.realisasi)
                            : form.realisasi
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "realisasi",
                            form.namaIndikator === "Scoring Publikasi"
                              ? e.target.value.replace(/\D/g, "")
                              : e.target.value
                          )
                        }
                        placeholder="Jumlah Realisasi"
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {type === "sertifikasi" && (
                  <>
                    <div className="w-full">
                      <Label className="mb-1 block">Nomor</Label>
                      <Input
                        value={form.nomor}
                        onChange={(e) => handleChange(index, "nomor", e.target.value)}
                        placeholder="Nomor Sertifikat"
                        className="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Nama</Label>
                      <Input
                        value={form.nama}
                        onChange={(e) => handleChange(index, "nama", e.target.value)}
                        placeholder="Nama Tower"
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(val) => handleChange(index, "status", val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Proses">Proses</SelectItem>
                          <SelectItem value="Selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Keterangan</Label>
                      <Input
                        value={form.keterangan}
                        onChange={(e) => handleChange(index, "keterangan", e.target.value)}
                        placeholder="Keterangan Tambahan"
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {type === "kepatuhan" && (
                  <>
                    <div className="w-full">
                      <Label className="mb-1 block">Indikator</Label>
                      <Input
                        value={form.indikator}
                        onChange={(e) => handleChange(index, "indikator", e.target.value)}
                        placeholder="Indikator Kepatuhan"
                        className="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Kategori</Label>
                      <Input
                        value={form.kategori}
                        onChange={(e) => handleChange(index, "kategori", e.target.value)}
                        placeholder="Kategori"
                        className="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Target</Label>
                      <Input
                        type="number"
                        value={form.target}
                        onChange={(e) => handleChange(index, "target", e.target.value)}
                        placeholder="Jumlah Eviden"
                        className="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Realisasi</Label>
                      <Input
                        type="number"
                        value={form.realisasi}
                        onChange={(e) => handleChange(index, "realisasi", e.target.value)}
                        placeholder="Jumlah Realisasi"
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Keterangan</Label>
                      <Input
                        value={form.keterangan}
                        onChange={(e) => handleChange(index, "keterangan", e.target.value)}
                        placeholder="Keterangan Tambahan"
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {/* **BARU**: Form untuk OCR */}
                {type === "ocr" && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Kategori OCR</Label>
                      <Select
                        value={form.kategoriOCR}
                        onValueChange={(val) => handleChange(index, "kategoriOCR", val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Kategori OCR" />
                        </SelectTrigger>
                        <SelectContent>
                          {KATEGORI_OCR_OPTIONS.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Target</Label>
                      <Input
                        type="number"
                        value={form.target}
                        onChange={(e) => handleChange(index, "target", e.target.value)}
                        placeholder="Jumlah Target"
                        className="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Realisasi</Label>
                      <Input
                        type="number"
                        value={form.realisasi}
                        onChange={(e) => handleChange(index, "realisasi", e.target.value)}
                        placeholder="Jumlah Realisasi"
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>

              {rows.length > 1 && (
                <div className="pt-4 mt-4 border-t flex">
                  <Button variant="destructive" size="sm" onClick={() => removeRow(index)}>
                    <IconTrash className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              )}
            </Card>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <Button
              variant="secondary"
              onClick={() => router.push(`/data/administrasi?type=${type}`)}
            >
              Kembali
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <Button variant="outline" onClick={addRow}>
                + Tambah Baris
              </Button>
              <Button className="bg-sky-500 hover:bg-sky-600" onClick={handleSubmit}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
