"use client"

import * as React from "react"
import { use, useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { toast } from "sonner"

type KeuanganType = "optimasi" | "aki" | "ao" | "attb"

const KATEGORI_OPTIONS = [
  "Perjalanan Dinas Non Diklat",
  "Bahan Makanan & Konsumsi",
  "Alat dan Keperluan Kantor",
  "Barang Cetakan",
]

function formatRupiah(value: string): string {
  const numberString = value.replace(/[^\d,]/g, "").replace(",", ".")
  const parts = numberString.split(".")
  const integerPart = parts[0].replace(/^0+/, "") || "0"
  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return parts.length > 1 ? `${formattedInt},${parts[1]}` : formattedInt
}

function parseRupiah(value: string): number {
  return Number(value.replace(/\./g, "").replace(",", "."))
}

export default function EditKeuanganPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeFromURL = searchParams.get("type") as KeuanganType
  const [type, setType] = useState<KeuanganType | null>(null)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    if (!typeFromURL) return

    async function fetchData() {
      try {
        const res = await fetch(`/api/keuangan?type=${typeFromURL}&id=${id}`)
        if (!res.ok) throw new Error("Gagal memuat data")

        const data = await res.json()
        setForm({
          ...data,
          penetapan: data.penetapan?.toString() || "",
          optimasi: data.optimasi?.toString() || "",
          target: data.target?.toString() || "",
          realisasi: data.realisasi?.toString() || "",
        })
        setType(data.type)
      } catch (error) {
        toast.error("Gagal memuat data.")
        router.push("/data/keuangan")
      }
    }

    fetchData()
  }, [typeFromURL, id, router])

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        penetapan: form.penetapan ? parseRupiah(form.penetapan) : undefined,
        optimasi: form.optimasi ? parseRupiah(form.optimasi) : undefined,
        target: form.target ? parseRupiah(form.target) : undefined,
        realisasi: form.realisasi ? parseRupiah(form.realisasi) : undefined,
      }

      const res = await fetch(`/api/keuangan?type=${type}&id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Gagal memperbarui data")

      toast.success("Data berhasil diperbarui")
      router.push(`/data/keuangan?type=${type}`)
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan.")
    }
  }

  if (!form || !type) {
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
            <div className="max-w-[90rem] md:mx-auto px-4 py-6 md:px-6">
              <div className="flex flex-col items-start justify-between gap-4 w-full sm:flex-row sm:items-center mb-6">
                <h1 className="text-2xl font-semibold">Edit Data Keuangan</h1>
                <div className="hidden sm:block sm:w-[243px] invisible">
                  <Select>
                    <SelectTrigger className="w-full" />
                  </Select>
                </div>
              </div>

              <Card className="w-full p-6 shadow-sm border rounded-lg flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Memuat data...</span>
              </Card>
            </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

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
            <h1 className="text-2xl font-semibold">Edit Data Keuangan</h1>
              <div className="hidden sm:block sm:w-[243px] invisible">
                <Select>
                  <SelectTrigger className="w-full" />
                </Select>
              </div>
          </div>

          <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
            <div className="space-y-4">
              <div className="w-full">
                <Label className="mb-1">Tahun</Label>
                <Input
                  type="text"
                  value={form.tahun}
                  onChange={(e) => handleChange("tahun", e.target.value)}
                />
              </div>

              {type === "aki" && (
                <div className="w-full">
                  <Label className="mb-1">Bulan</Label>
                  <Select
                    value={form.bulan}
                    onValueChange={(val) => handleChange("bulan", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
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
                    <Label className="mb-1">Bulan</Label>
                    <Select
                      value={form.bulan}
                      onValueChange={(val) => handleChange("bulan", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                          "Juli", "Agustus", "September", "Oktober", "November", "Desember",
                        ].map((bulan) => (
                          <SelectItem key={bulan} value={bulan}>
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
                      onValueChange={(val) => handleChange("kategori", val)}
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
                  <Label className="mb-1">Semester</Label>
                  <Select
                    value={form.semester}
                    onValueChange={(val) => handleChange("semester", val)}
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
                    <Label className="mb-1">Penetapan</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatRupiah(form.penetapan)}
                      onChange={(e) => handleChange("penetapan", e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <Label className="mb-1">Optimasi</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatRupiah(form.optimasi)}
                      onChange={(e) => handleChange("optimasi", e.target.value)}
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
                    onChange={(e) => handleChange("target", e.target.value)}
                  />
                </div>
              )}

              <div className="w-full">
                <Label className="mb-1">Realisasi</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiah(form.realisasi)}
                  onChange={(e) => handleChange("realisasi", e.target.value)}
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push(`/data/keuangan?type=${type}`)}
            >
              Kembali
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit}>
              Simpan
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
