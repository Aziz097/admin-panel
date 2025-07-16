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

type AdministrasiType = "komunikasi" | "sertifikasi" | "kepatuhan" | "ocr";

interface KomunikasiForm {
  tahun: string;
  bulan: string;
  namaIndikator: string;
  target: string;
  realisasi: string;
}

interface SertifikasiForm {
  tahun: string;
  bulan: string;
  nomor: string;
  nama: string;
  status: string;
  keterangan: string;
}

interface KepatuhanForm {
  tahun: string;
  bulan: string;
  indikator: string;
  kategori: string;
  target: string;
  realisasi: string;
  keterangan: string;
}

interface OCRForm {
  tahun: string;
  semester: string;
  kategoriOCR: string;
  target: string;
  realisasi: string;
}

type FormData = KomunikasiForm | SertifikasiForm | KepatuhanForm | OCRForm;

// Type guard functions
const isKomunikasiForm = (form: FormData): form is KomunikasiForm => {
  return 'namaIndikator' in form;
};

const isSertifikasiForm = (form: FormData): form is SertifikasiForm => {
  return 'nomor' in form && 'nama' in form;
};

const isKepatuhanForm = (form: FormData): form is KepatuhanForm => {
  return 'indikator' in form && 'kategori' in form;
};

const isOCRForm = (form: FormData): form is OCRForm => {
  return 'kategoriOCR' in form && 'semester' in form;
};

// Helper function to safely get target/realisasi values
const getTargetRealisasi = (form: FormData) => {
  if (isKomunikasiForm(form) || isKepatuhanForm(form) || isOCRForm(form)) {
    return { target: form.target, realisasi: form.realisasi };
  }
  return { target: '', realisasi: '' };
};

// Helper function to safely get month/semester value
const getMonthSemester = (form: FormData) => {
  if (isOCRForm(form)) {
    return form.semester;
  }
  if (isKomunikasiForm(form) || isSertifikasiForm(form) || isKepatuhanForm(form)) {
    return form.bulan;
  }
  return '';
};

interface KomunikasiPayload {
  tahun: string;
  bulan: string;
  namaIndikator: string;
  target: number;
  realisasi: number | null;
}

interface SertifikasiPayload {
  tahun: string;
  bulan: string;
  nomor: string;
  nama: string;
  status: string;
  keterangan: string;
}

interface KepatuhanPayload {
  tahun: string;
  bulan: string;
  indikator: string;
  kategori: string;
  target: number;
  realisasi: number | null;
  keterangan: string | null;
}

interface OCRPayload {
  tahun: string;
  semester: string;
  kategoriOCR: string;
  target: number;
  realisasi: number | null;
}

const INDIKATOR_KOMUNIKASI_OPTIONS = [
  "Release Berita", "Konten Foto", "Akun Influencer Aktif",
  "Share Berita Internal", "Scoring Publikasi", "Laporan Permintaan Publik",
];

const KATEGORI_OCR_OPTIONS = ["KC", "COP", "KS", "Inovasi"];

const getMonthName = (monthNum: string): string => {
  if (!monthNum) return "";
  const monthNames: { [key: string]: string } = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
  };
  return monthNames[monthNum] || monthNum;
};

function formatIDR(value: string): string {
  const num = value.replace(/\D/g, "");
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(parseInt(num || "0"));
}

function EditFormSkeleton() {
  return (
    <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function EditAdministrasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFromURL = searchParams.get("type") as AdministrasiType

  const [form, setForm] = useState<FormData | null>(null)
  const [type, setType] = useState<AdministrasiType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [displayTarget, setDisplayTarget] = useState("")
  const [displayRealisasi, setDisplayRealisasi] = useState("")

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

        const initialFormState: FormData = {
          ...data,
          target: data.target?.toString() ?? "",
          realisasi: data.realisasi?.toString() ?? "",
          status: data.status?.toString() ?? "",
          keterangan: data.keterangan ?? "",
          nomor: data.nomor ?? "",
          nama: data.nama ?? "",
          namaIndikator: data.namaIndikator ?? "",
          indikator: data.indikator ?? "",
          kategori: data.kategori ?? "",
          kategoriOCR: data.kategoriOCR ?? "",
          semester: data.semester ?? "",
          bulan: data.bulan ?? "",
          tahun: data.tahun ?? "",
        };

        setForm(initialFormState);
        setType(typeFromURL)

        // Init display formatting
        if (typeFromURL === "komunikasi" && data.namaIndikator === "Scoring Publikasi") {
          const { target, realisasi } = getTargetRealisasi(initialFormState);
          setDisplayTarget(formatIDR(target))
          setDisplayRealisasi(formatIDR(realisasi))
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Gagal memuat data.";
        toast.error(errorMessage);
        router.push(`/data/administrasi?type=${typeFromURL || 'komunikasi'}`)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData()
  }, [typeFromURL, id, router])

  const handleChange = (field: string, value: string) => {
    setForm((prev: FormData | null) => prev ? ({ ...prev, [field]: value }) : null)
  }

  const handleSubmit = async () => {
    if (!type || !form) return;

    try {
      let payload: KomunikasiPayload | SertifikasiPayload | KepatuhanPayload | OCRPayload;

      switch (type) {
        case "komunikasi":
          const komunikasiForm = form as KomunikasiForm;
          payload = {
            tahun: komunikasiForm.tahun,
            bulan: komunikasiForm.bulan,
            namaIndikator: komunikasiForm.namaIndikator,
            target: parseInt(komunikasiForm.target, 10) || 0,
            realisasi: komunikasiForm.realisasi ? parseInt(komunikasiForm.realisasi, 10) : null,
          };
          break;
        case "sertifikasi":
          const sertifikasiForm = form as SertifikasiForm;
          payload = {
            tahun: sertifikasiForm.tahun,
            bulan: sertifikasiForm.bulan,
            nomor: sertifikasiForm.nomor,
            nama: sertifikasiForm.nama,
            status: sertifikasiForm.status,
            keterangan: sertifikasiForm.keterangan,
          };
          break;
        case "kepatuhan":
          const kepatuhanForm = form as KepatuhanForm;
          payload = {
            tahun: kepatuhanForm.tahun,
            bulan: kepatuhanForm.bulan,
            indikator: kepatuhanForm.indikator,
            kategori: kepatuhanForm.kategori,
            target: parseInt(kepatuhanForm.target, 10) || 0,
            realisasi: kepatuhanForm.realisasi ? parseInt(kepatuhanForm.realisasi, 10) : null,
            keterangan: kepatuhanForm.keterangan || null,
          };
          break;
        case "ocr":
          const ocrForm = form as OCRForm;
          payload = {
            tahun: ocrForm.tahun,
            semester: ocrForm.semester,
            kategoriOCR: ocrForm.kategoriOCR,
            target: parseInt(ocrForm.target, 10) || 0,
            realisasi: ocrForm.realisasi ? parseInt(ocrForm.realisasi, 10) : null,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.";
      toast.error(errorMessage);
    }
  }

if (isLoading) { 
  return ( 
  <SidebarProvider> 
    <AppSidebar variant="inset" /> 
    <SidebarInset> 
      <SiteHeader /> 
      <div className="max-w-[100rem] md:mx-auto px-4 py-6 space-y-6 md:px-6"> 
        <h1 className="text-2xl font-semibold">Edit Data Administrasi</h1> 
        <EditFormSkeleton /> 
      </div> 
    </SidebarInset> 
  </SidebarProvider> ) 
    } 

if (!form || !type) { 
  return ( 
  <SidebarProvider>
    <AppSidebar variant="inset" /> 
    <SidebarInset> 
      <SiteHeader /> 
      <div className="max-w-[90rem] md:mx-auto px-4 py-6 space-y-6 md:px-6"> 
        <h1 className="text-2xl font-semibold">Edit Data Administrasi</h1> 
        <p className="text-red-500">Data tidak ditemukan atau tidak valid.</p> 
      </div> 
    </SidebarInset> 
  </SidebarProvider> ) }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="max-w-[90rem] md:mx-auto px-4 py-6 space-y-6 md:px-6">
          <h1 className="text-2xl font-semibold">Edit Data Administrasi: {type.charAt(0).toUpperCase() + type.slice(1)}</h1>
          <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <Label className="mb-1 block">Tahun</Label>
                <Input className="w-full" type="number" value={form.tahun} onChange={(e) => handleChange("tahun", e.target.value)} />
              </div>

              {type !== 'ocr' ? (
                <div className="w-full">
                  <Label className="mb-1 block">Bulan</Label>
                  <Select value={getMonthSemester(form)} onValueChange={(val) => handleChange("bulan", val)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Bulan" /></SelectTrigger>
                    <SelectContent>
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(b => (
                        <SelectItem key={b} value={b}>{getMonthName(b)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="w-full">
                  <Label className="mb-1 block">Semester</Label>
                  <Select value={getMonthSemester(form)} onValueChange={(val) => handleChange("semester", val)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {type === 'komunikasi' && (
                <>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block">Nama Indikator</Label>
                    <Select value={(form as KomunikasiForm).namaIndikator} onValueChange={(val) => {
                      handleChange("namaIndikator", val);
                      if (val === "Scoring Publikasi") {
                        const { target, realisasi } = getTargetRealisasi(form);
                        setDisplayTarget(formatIDR(target))
                        setDisplayRealisasi(formatIDR(realisasi))
                      }
                    }}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Indikator" /></SelectTrigger>
                      <SelectContent>
                        {INDIKATOR_KOMUNIKASI_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full">
                    <Label className="mb-1 block">Target</Label>
                    {(form as KomunikasiForm).namaIndikator === "Scoring Publikasi" ? (
                      <Input
                        value={displayTarget}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setDisplayTarget(formatIDR(raw))
                          handleChange("target", raw)
                        }}
                      />
                    ) : (
                      <Input type="number" value={getTargetRealisasi(form).target} onChange={(e) => handleChange("target", e.target.value)} />
                    )}
                  </div>

                  <div className="w-full">
                    <Label className="mb-1 block">Realisasi</Label>
                    {(form as KomunikasiForm).namaIndikator === "Scoring Publikasi" ? (
                      <Input
                        value={displayRealisasi}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setDisplayRealisasi(formatIDR(raw))
                          handleChange("realisasi", raw)
                        }}
                      />
                    ) : (
                      <Input type="number" value={getTargetRealisasi(form).realisasi} onChange={(e) => handleChange("realisasi", e.target.value)} />
                    )}
                  </div>
                </>
              )}

                {type === 'sertifikasi' && (
                    <>
                        <div className="w-full">
                            <Label className="mb-1 block">Nomor</Label>
                            <Input className="w-full" value={(form as SertifikasiForm).nomor} onChange={(e) => handleChange("nomor", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Nama</Label>
                            <Input className="w-full" value={(form as SertifikasiForm).nama} onChange={(e) => handleChange("nama", e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <Label className="mb-1 block">Status</Label>
                            <Select value={(form as SertifikasiForm).status} onValueChange={(val) => handleChange("status", val)}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Proses">Proses</SelectItem>
                                    <SelectItem value="Selesai">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label className="mb-1 block">Keterangan</Label>
                            <Input className="w-full" value={(form as SertifikasiForm).keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />
                        </div>
                    </>
                )}

                {type === 'kepatuhan' && (
                      <>
                        <div className="w-full">
                            <Label className="mb-1 block">Indikator</Label>
                            <Input className="w-full" value={(form as KepatuhanForm).indikator} onChange={(e) => handleChange("indikator", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Kategori</Label>
                            <Input className="w-full" value={(form as KepatuhanForm).kategori} onChange={(e) => handleChange("kategori", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Target</Label>
                            <Input className="w-full" type="number" value={getTargetRealisasi(form).target} onChange={(e) => handleChange("target", e.target.value)} />
                        </div>
                        <div className="w-full">
                            <Label className="mb-1 block">Realisasi</Label>
                            <Input className="w-full" type="number" value={getTargetRealisasi(form).realisasi} onChange={(e) => handleChange("realisasi", e.target.value)} />
                        </div>
                         <div className="md:col-span-2">
                            <Label className="mb-1 block">Keterangan</Label>
                            <Input className="w-full" value={(form as KepatuhanForm).keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />
                        </div>
                    </>
                )}
                
                {type === "ocr" && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Kategori OCR</Label>
                      <Select value={(form as OCRForm).kategoriOCR} onValueChange={(val) => handleChange("kategoriOCR", val)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Kategori OCR" /></SelectTrigger>
                          <SelectContent>
                              {KATEGORI_OCR_OPTIONS.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Target</Label>
                      <Input type="number" value={getTargetRealisasi(form).target} onChange={(e) => handleChange("target", e.target.value)} placeholder="Jumlah Target" className="w-full"/>
                    </div>
                    <div className="w-full">
                      <Label className="mb-1 block">Realisasi</Label>
                      <Input type="number" value={getTargetRealisasi(form).realisasi} onChange={(e) => handleChange("realisasi", e.target.value)} placeholder="Jumlah Realisasi" className="w-full"/>
                    </div>
                  </>
                )}
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={() => router.push(`/data/administrasi?type=${type}`)}>
              Kembali
            </Button>
            <Button className="bg-sky-500 hover:bg-sky-600" onClick={handleSubmit}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}