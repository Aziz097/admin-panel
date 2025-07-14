"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { IconPlus, IconTrash } from "@tabler/icons-react"

// Define the structure for a single employee row in the form
type PegawaiRow = {
  nama: string
  nip: string
  jabatan: string
}

// Define the initial state for a new empty row
const EMPTY_ROW: PegawaiRow = {
  nama: "",
  nip: "",
  jabatan: "",
}

/**
 * CreatePegawaiPage Component
 * Renders a form to add one or more new employees.
 * It supports dynamically adding and removing rows before submission.
 */
export default function CreatePegawaiPage() {
  const router = useRouter()
  // State to hold an array of employee rows
  const [rows, setRows] = useState<PegawaiRow[]>([EMPTY_ROW])
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles changes for a specific input field in a specific row.
   * @param index - The index of the row being edited.
   * @param field - The name of the field being changed (e.g., 'nama', 'nip').
   * @param value - The new value from the input field.
   */
  const handleChange = (index: number, field: keyof PegawaiRow, value: string) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value
    setRows(updatedRows)
  }

  // Adds a new, empty employee row to the form
  const addRow = () => {
    setRows([...rows, EMPTY_ROW])
  }

  // Removes an employee row from the form at a specific index
  const removeRow = (index: number) => {
    // Prevents removing the last remaining row
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index)
      setRows(updatedRows)
    }
  }

  /**
   * Handles the form submission.
   * Validates all rows and sends them to the backend API.
   */
  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Validate that no fields in any row are empty
    const isValid = rows.every(
      (row) => row.nama.trim() && row.nip.trim() && row.jabatan.trim()
    )

    if (!isValid) {
      toast.error("Harap isi semua field untuk setiap baris.")
      setIsSubmitting(false)
      return
    }

    try {
      // The backend must be able to handle an array of new employees
      const res = await fetch("/api/pegawai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Gagal menambahkan data pegawai.")
      }

      toast.success(`${rows.length} data pegawai berhasil ditambahkan.`)
      router.push("/data/pegawai") // Redirect after successful submission
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="max-w-4xl md:mx-auto px-4 py-6 space-y-6 md:px-6">
          <h1 className="text-2xl font-semibold">Tambah Data Pegawai</h1>

          {/* Map through each row and render a form card */}
          {rows.map((row, index) => (
            <Card key={index} className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <Label htmlFor={`nama-${index}`} className="mb-1 block">Nama Lengkap</Label>
                  <Input
                    id={`nama-${index}`}
                    value={row.nama}
                    onChange={(e) => handleChange(index, "nama", e.target.value)}
                    placeholder="Masukkan Nama"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor={`nip-${index}`} className="mb-1 block">NIP</Label>
                  <Input
                    id={`nip-${index}`}
                    value={row.nip}
                    onChange={(e) => handleChange(index, "nip", e.target.value)}
                    placeholder="Masukkan NIP"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="w-full md:col-span-2">
                  <Label htmlFor={`jabatan-${index}`} className="mb-1 block">Jabatan</Label>
                  <Input
                    id={`jabatan-${index}`}
                    value={row.jabatan}
                    onChange={(e) => handleChange(index, "jabatan", e.target.value)}
                    placeholder="Masukkan Jabatan"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              {/* Delete button styled like the new reference */}
              {rows.length > 1 && (
                <div className="pt-4 mt-4 border-t flex">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={isSubmitting}
                  >
                    <IconTrash className="w-4 h-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {/* Action buttons at the bottom */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mt-6">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push("/data/pegawai")}
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={addRow}
                disabled={isSubmitting}
              >
                + Tambah Baris
              </Button>
              <Button
                className="w-full bg-sky-500 hover:bg-sky-500 sm:w-auto"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : `Simpan ${rows.length} Data`}
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
