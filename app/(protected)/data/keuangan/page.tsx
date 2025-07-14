// app/(protected)/data/keuangan/page.tsx
"use client"

import React from "react"
import dynamic from "next/dynamic"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

// dynamically import your DataTable with SSR disabled
const DataTable = dynamic(
  () => import("@/components/data-table-keuangan").then((mod) => mod.DataTable),
  { ssr: false }
)

export default function KeuanganPage() {
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
        {/* DataTable now only renders in the browser */}
        <DataTable />
      </SidebarInset>
    </SidebarProvider>
  )
}
