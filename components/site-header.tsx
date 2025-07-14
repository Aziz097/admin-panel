"use client"

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface SiteHeaderProps {
  tahun?: string
  setTahun?: (val: string) => void
}

const dashboardOptions = [
  { label: "Administrasi", value: "/dashboard/administrasi" },
  { label: "Keuangan", value: "/dashboard/keuangan" },
];

// Menghapus array statis `tahunList`

export function SiteHeader({ tahun, setTahun }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<string>("");

  // State untuk menyimpan daftar tahun dari API
  const [tahunOptions, setTahunOptions] = useState<string[]>([]);
  // State untuk loading
  const [isLoadingTahun, setIsLoadingTahun] = useState(true);


  // Set mounted to true once the component is client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // useEffect untuk mengambil data tahun saat komponen di-mount
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        setIsLoadingTahun(true);
        const response = await fetch('/api/tahun');
        if (!response.ok) {
          throw new Error('Gagal mengambil data tahun');
        }
        const data: string[] = await response.json();
        setTahunOptions(data);

        // Jika `setTahun` tersedia dan ada data tahun,
        // atur tahun default ke yang terbaru jika belum ada atau tidak valid.
        if (setTahun && data.length > 0 && (!tahun || !data.includes(tahun))) {
          setTahun(data[0]); // `data[0]` adalah tahun terbaru karena API mengurutkannya
        }
      } catch (error) {
        console.error("Error fetching 'tahun' data:", error);
        setTahunOptions([]); // Set ke array kosong jika gagal
      } finally {
        setIsLoadingTahun(false);
      }
    };

    fetchTahun();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTahun]); // Menambahkan setTahun sebagai dependensi

  // Set dashboard tab on client mount
  useEffect(() => {
    const currentTab =
      dashboardOptions.find(opt => pathname?.startsWith(opt.value))?.value || dashboardOptions[0].value;
    setDashboardTab(currentTab);
  }, [pathname]);

  const isDashboard = pathname?.startsWith("/dashboard");

  // Avoid rendering while server-side
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center border-b transition-[width,height] ease-linear px-2 sm:px-4">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-2 hidden sm:block data-[orientation=vertical]:h-4" />

        {/* Segmented tabs directly after sidebar trigger */}
        {isDashboard && (
          <Tabs
            value={dashboardTab}
            onValueChange={val => {
              if (val && val !== dashboardTab) {
                setDashboardTab(val);
                router.push(val); // Update router on tab change
              }
            }}
            className="h-9 flex-1"
          >
            <TabsList
              className="
                rounded-sm bg-white h-9 px-1 flex items-center
                space-x-1
                min-w-[220px]
                sm:min-w-[280px]
                overflow-x-auto
              "
            >
              {dashboardOptions.map(opt => (
                <TabsTrigger
                  key={opt.value}
                  value={opt.value}
                  className="
                    cursor-pointer
                    rounded-sm
                    px-3 py-1.5
                    text-base font-semibold
                    transition-all duration-200
                    data-[state=active]:bg-sky-500
                    data-[state=active]:text-white
                    data-[state=active]:scale-95
                    data-[state=active]:shadow-md
                    bg-transparent
                    focus-visible:outline-none
                    whitespace-nowrap
                  "
                  style={{
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Select Tahun (diperbarui) */}
          {tahun && setTahun && (
            <Select value={tahun} onValueChange={(val) => setTahun(val)} disabled={isLoadingTahun || tahunOptions.length === 0}>
              <SelectTrigger className="w-[100px] h-9 cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 font-semibold">
                <SelectValue placeholder={isLoadingTahun ? "Memuat..." : "Tahun"} />
              </SelectTrigger>
              <SelectContent>
                {/* Mapping dari state `tahunOptions` */}
                {tahunOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </header>
  );
}