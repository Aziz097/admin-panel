"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartRadialATTB } from "@/components/chart/keuangan/chart-radial-attb"
import { ChartRadialAO } from "@/components/chart/keuangan/chart-radial-ao"
import { SiteHeader } from "@/components/site-header"
import { ChartBarStacked } from "@/components/chart/keuangan/chart-bar-aki"
import { ChartAreaGradient } from "@/components/chart/keuangan/chart-area-optimasi"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useState } from "react"

export default function Page() {
  const [tahun, setTahun] = useState("2024")

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <h2 className="px-6 text-2xl font-bold">Dashboard Keuangan</h2>
              <div className="px-4 lg:px-6">
                <ChartAreaGradient tahun={tahun} />
              </div>
              <div className="px-4 lg:px-6">
                <ChartBarStacked tahun={tahun} />
              </div>
              <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartRadialAO tahun={tahun} />
                <ChartRadialATTB tahun={tahun} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
