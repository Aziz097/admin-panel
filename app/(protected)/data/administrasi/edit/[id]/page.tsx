"use client"

import * as React from "react"
import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { toast } from "sonner"

// **DIUBAH**: Menghapus 'tjsl' dan menambahkan 'ocr'
type AdministrasiType = "komunikasi" | "sertifikasi" | "kepatuhan" | "ocr";

const INDIKATOR_KOMUNIKASI_OPTIONS = [
    "Release Berita", "Konten Foto", "Akun Influencer Aktif",
    "Share Berita Internal", "Scoring Publikasi", "Laporan Permintaan Publik",
];

const KATEGORI_OCR_OPTIONS = ["KC", "COP", "KP", "Inovasi"];

const getMonthName = (monthNum: string): string => {
    if (!monthNum) return "";
    const monthNames: { [key: string]: string } = {
        '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April', 
        '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus', 
        '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
    };
    return monthNames[monthNum] || monthNum;
};

// **BARU**: Komponen Skeleton untuk form
function EditFormSkeleton() {
    return (
        <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </Card>
    )
}

export default function EditAdministrasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFromURL = searchParams.get("type") as AdministrasiType

  const [form, setForm] = useState<any>(null)
  const [type, setType] = useState<AdministrasiType | null>(null)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!typeFromURL || !id) {
        toast.error("Parameter tidak valid.");
        router.push('/data/administrasi');
        return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/administrasi?type=${typeFromURL}&id=${id}`)
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Gagal memuat data untuk diedit")
        }

        const data = await res.json()

        if (!data) {
            throw new Error("Data tidak ditemukan.");
        }
        
        const initialFormState = {
          ...data,
          target: data.target?.toString() ?? "",
          realisasi: data.realisasi?.toString() ?? "",
          status: data.status?.toString(), 
        };

        setForm(initialFormState);
        setType(typeFromURL)
      } catch (error: any) {
        toast.error(error.message || "Gagal memuat data.");
        router.push(`/data/administrasi?type=${typeFromURL || 'komunikasi'}`)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [typeFromURL, id, router])

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!type || !form) return;

    try {
        let payload: any;

        switch (type) {
          case "komunikasi":
            payload = {
              tahun: form.tahun,
              bulan: form.bulan,
              namaIndikator: form.namaIndikator,
              target: parseInt(form.target, 10) || 0,
              realisasi: form.realisasi ? parseInt(form.realisasi, 10) : null,
            };
            break;
          case "sertifikasi":
            payload = {
              tahun: form.tahun,
              bulan: form.bulan,
              nomor: form.nomor,
              nama: form.nama,
              status: form.status,
              keterangan: form.keterangan,
            };
            break;
          case "kepatuhan":
            payload = {
              tahun: form.tahun,
              bulan: form.bulan,
              indikator: form.indikator,
              kategori: form.kategori,
              target: parseInt(form.target, 10) || 0,
              realisasi: form.realisasi ? parseInt(form.realisasi, 10) : null,
              keterangan: form.keterangan || null,
            };
            break;
          case "ocr":
            payload = {
              tahun: form.tahun,
              semester: form.semester,
              kategoriOCR: form.kategoriOCR,
              target: parseInt(form.target, 10) || 0,
              realisasi: form.realisasi ? parseInt(form.realisasi, 10) : null,
            };
            break;
          default:
            throw new Error("Tipe administrasi tidak valid");
        }

      const res = await fetch(`/api/administrasi?type=${type}&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal memperbarui data")
      }

      toast.success("Data berhasil diperbarui")
      router.push(`/data/administrasi?type=${type}`)
      router.refresh(); 
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan.")
    }
  }

  // **DIUBAH**: Menggunakan komponen Skeleton saat loading
  if (isLoading || !form || !type) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
            <div className="max-w-[90rem] md:mx-auto px-4 py-6 md:px-6 space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <EditFormSkeleton />
            </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="max-w-[90rem] md:mx-auto px-4 py-6 space-y-6 md:px-6">
          <h1 className="text-2xl font-semibold">Edit Data Administrasi: {type.charAt(0).toUpperCase() + type.slice(1)}</h1>

          <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Fields */}
                <div className="w-full">
                    <Label className="mb-1 block">Tahun</Label>
                    <Input className="w-full" type="number" value={form.tahun} onChange={(e) => handleChange("tahun", e.target.value)} />
                </div>
                
                {type !== 'ocr' ? (
                    <div className="w-full">
                        <Label className="mb-1 block">Bulan</Label>
                        <Select value={form.bulan} onValueChange={(val) => handleChange("bulan", val)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
                            <SelectContent>
                            {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(b => <SelectItem key={b} value={b}>{getMonthName(b)}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div className="w-full">
                        <Label className="mb-1 block">Semester</Label>
                        <Select value={form.semester} onValueChange={(val) => handleChange("semester", val)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Semester 1</SelectItem>
                                <SelectItem value="2">Semester 2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}


                {/* Dynamic Fields */}
                {type === 'komunikasi' && (
                    <>
                        <div className="md:col-span-2">
                            <Label className="mb-1 block">Nama Indikator</Label>
                            <Select value={form.namaIndikator} onValueChange={(val) => handleChange("namaIndikator", val)}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Indikator" /></SelectTrigger>
                                <SelectContent>
                                    {INDIKATOR_KOMUNIKASI_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Target</Label>
                            <Input className="w-full" type="number" value={form.target} onChange={(e) => handleChange("target", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Realisasi (Opsional)</Label>
                            <Input className="w-full" type="number" value={form.realisasi} onChange={(e) => handleChange("realisasi", e.target.value)} />
                        </div>
                    </>
                )}

                {type === 'sertifikasi' && (
                    <>
                        <div className="w-full">
                            <Label className="mb-1 block">Nomor</Label>
                            <Input className="w-full" value={form.nomor} onChange={(e) => handleChange("nomor", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Nama</Label>
                            <Input className="w-full" value={form.nama} onChange={(e) => handleChange("nama", e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="mb-1 block">Status</Label>
                            <Select value={form.status} onValueChange={(val) => handleChange("status", val)}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Proses">Proses</SelectItem>
                                    <SelectItem value="Selesai">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label className="mb-1 block">Keterangan</Label>
                            <Input className="w-full" value={form.keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />
                        </div>
                    </>
                )}

                {type === 'kepatuhan' && (
                      <>
                        <div className="w-full">
                            <Label className="mb-1 block">Indikator</Label>
                            <Input className="w-full" value={form.indikator} onChange={(e) => handleChange("indikator", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Kategori</Label>
                            <Input className="w-full" value={form.kategori} onChange={(e) => handleChange("kategori", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Target</Label>
                            <Input className="w-full" type="number" value={form.target} onChange={(e) => handleChange("target", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Realisasi (Opsional)</Label>
                            <Input className="w-full" type="number" value={form.realisasi} onChange={(e) => handleChange("realisasi", e.target.value)} />
                        </div>
                         <div className="md:col-span-2">
                            <Label className="mb-1 block">Keterangan (Opsional)</Label>
                            <Input className="w-full" value={form.keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />
                        </div>
                    </>
                )}
                
                {type === "ocr" && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Kategori OCR</Label>
                      <Select value={form.kategoriOCR} onValueChange={(val) => handleChange("kategoriOCR", val)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Kategori OCR" /></SelectTrigger>
                          <SelectContent>
                              {KATEGORI_OCR_OPTIONS.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Target</Label>
                      <Input type="number" value={form.target} onChange={(e) => handleChange("target", e.target.value)} placeholder="Jumlah Target" className="w-full"/>
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Realisasi (Opsional)</Label>
                      <Input type="number" value={form.realisasi} onChange={(e) => handleChange("realisasi", e.target.value)} placeholder="Jumlah Realisasi" className="w-full"/>
                    </div>
                  </>
                )}
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={() => router.push(`/data/administrasi?type=${type}`)}>
              Kembali
            </Button>
            <Button onClick={handleSubmit}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
