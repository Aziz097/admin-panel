"use client"

import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Icon } from "@tabler/icons-react"
import { useRouter } from 'next/navigation';

type NavItem = {
  title: string
  url?: string
  icon?: Icon
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const router = useRouter()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) =>
            item.items ? (
              <Collapsible key={item.title} asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="flex items-center w-full gap-2 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                        <span className="truncate leading-none">{item.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <button
                              onClick={() => router.push(subItem.url)}
                              className="pl-4 py-1.5 text-sm w-full text-left rounded-md transition-colors hover:bg-muted"
                            >
                              {subItem.title}
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                >
                  <button
                    onClick={() => item.url && router.push(item.url)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span className="truncate">{item.title}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
