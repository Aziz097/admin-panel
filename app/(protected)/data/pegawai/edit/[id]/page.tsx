"use client"

import * as React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Define the type for the form data, matching the Pegawai model
type PegawaiFormData = {
  nama: string;
  nip: string;
  jabatan: string;
};

/**
 * Skeleton component for the edit form loading state.
 * Mimics the layout of the actual form.
 */
function EditFormSkeleton() {
    return (
        <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/5" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </Card>
    )
}

/**
 * EditPegawaiPage Component
 * Fetches a single employee's data by ID and provides a form to edit and save the changes.
 */
export default function EditPegawaiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State management
  const [formData, setFormData] = useState<PegawaiFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing employee data when the component mounts
  useEffect(() => {
    if (!id) {
      router.push('/data/pegawai');
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/pegawai?id=${id}`);
        if (!res.ok) {
          throw new Error("Gagal memuat data pegawai.");
        }
        const data = await res.json();
        if (!data) {
          throw new Error("Data pegawai tidak ditemukan.");
        }
        setFormData(data);
      } catch (error: any) {
        toast.error(error.message);
        router.push('/data/pegawai');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  /**
   * Handles changes in form input fields.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  /**
   * Handles form submission to update the employee data.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!formData.nama || !formData.nip || !formData.jabatan) {
      toast.error("Semua field harus diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pegawai?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui data.");
      }

      toast.success("Data pegawai berhasil diperbarui.");
      router.push("/data/pegawai");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display a loading state using the skeleton component
  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
            <div className="max-w-2xl mx-auto px-4 py-6 md:px-6 space-y-6">
              <Skeleton className="h-8 w-1/2" />
              <EditFormSkeleton />
            </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Render the main form once data is loaded
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="w-xl md:mx-auto px-4 py-6 space-y-6 md:px-6">
          <h1 className="text-2xl font-semibold">Edit Data Pegawai</h1>

          <form onSubmit={handleSubmit}>
            <Card className="w-full p-4 shadow-sm border rounded-lg sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="w-full">
                  <Label htmlFor="nama" className="mb-1 block">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    name="nama"
                    value={formData?.nama || ""}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap pegawai"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="nip" className="mb-1 block">NIP</Label>
                  <Input
                    id="nip"
                    name="nip"
                    value={formData?.nip || ""}
                    onChange={handleChange}
                    placeholder="Masukkan NIP pegawai"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="jabatan" className="mb-1 block">Jabatan</Label>
                  <Input
                    id="jabatan"
                    name="jabatan"
                    value={formData?.jabatan || ""}
                    onChange={handleChange}
                    placeholder="Masukkan jabatan pegawai"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/data/pegawai")}
                disabled={isSubmitting}
              >
                Kembali
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-sky-500 hover:bg-sky-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
