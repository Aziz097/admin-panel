"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SummaryKomunikasi } from "@/components/chart/administrasi/summary-komunikasi"
import { TableSertifikasi } from "@/components/chart/administrasi/table-sertifikasi"
import { SummaryKepatuhan } from "@/components/chart/administrasi/summary-kepatuhan"
import { TableChartTJSL } from "@/components/chart/administrasi/card-tjsl"
import { ChartBarOCR } from "@/components/chart/administrasi/chart-bar-ocr"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"

export default function Page() {
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader tahun={tahun} setTahun={setTahun} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <h2 className="text-2xl font-semibold">Dashboard Administrasi</h2>
            <SummaryKomunikasi />
            <ChartBarOCR tahun={tahun} />
            <TableSertifikasi />
            <SummaryKepatuhan />
            <TableChartTJSL tahun={tahun} /> 
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
