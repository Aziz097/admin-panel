"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PegawaiDataTable } from "@/components/pegawai-table" // Import the new Pegawai table

/**
 * PegawaiPage component
 * * This is the main page for displaying the employee data.
 * It sets up the application layout with a sidebar and header,
 * and renders the PegawaiDataTable as the primary content area.
 */
export default function PegawaiPage() {
  return (
    // SidebarProvider sets up the context for the sidebar layout.
    // CSS variables are used to control the dimensions of the layout components.
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      {/* The main application sidebar */}
      <AppSidebar variant="inset" />

      {/* SidebarInset wraps the main content, ensuring it is positioned correctly
          relative to the sidebar. */}
      <SidebarInset>
        {/* The main site header */}
        <SiteHeader />

        {/* The Pegawai data table, which contains all the logic for
            displaying, filtering, and managing employee data. */}
        <PegawaiDataTable />
      </SidebarInset>
    </SidebarProvider>
  )
}
