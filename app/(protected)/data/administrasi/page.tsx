// app/(protected)/data/administrasi/page.tsx
'use client'

import dynamic from 'next/dynamic'
import * as React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

// Dynamically import with SSR disabled
const DataTable = dynamic(
  () => import('@/components/data-table-administrasi').then((mod) => mod.DataTable),
  { ssr: false }
)

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {/* Now completely client-only; no suspense errors in build */}
        <DataTable />
      </SidebarInset>
    </SidebarProvider>
  )
}
