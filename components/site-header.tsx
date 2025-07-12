"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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

const tahunList = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];

export function SiteHeader({ tahun, setTahun }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const [dashboardTab, setDashboardTab] = useState<string>("");

  // Set mounted to true once the component is client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear px-2 sm:px-4">
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
                    data-[state=active]:bg-sky-400
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
          {/* Select Tahun */}
          {tahun && setTahun && (
            <Select value={tahun} onValueChange={(val) => setTahun(val)}>
              <SelectTrigger className="w-[100px] h-9 cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 font-semibold">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {tahunList.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Github button */}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground cursor-pointer"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
