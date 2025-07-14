"use client"

import * as React from "react"
import {
  IconDashboard,
  IconDatabase,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  navMain: [
    {
      title: "Dashboard",
      icon: IconDashboard,
      items: [
        {
          title: "Administrasi",
          url: "/dashboard/administrasi",
        },
        {
          title: "Keuangan",
          url: "/dashboard/keuangan",
        },
      ],
    },
    {
      title: "Data",
      icon: IconDatabase,
            items: [
        {
          title: "Administrasi",
          url: "/data/administrasi",
        },
        {
          title: "Keuangan",
          url: "/data/keuangan",
        },
        {
          title: "Pegawai",
          url: "/data/pegawai",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
              <Image
                src="/logo-upt-tkr.png"
                width={150}
                height={150}
                alt="UPT PLN Logo"
                className="object-contain h-10 w-auto cursor-pointer"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
