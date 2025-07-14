"use client"

import { useSession } from "next-auth/react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  IconDotsVertical,
  IconLogout,
  IconLogin,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { signOutAction } from "@/lib/actions"
import { toast } from "sonner" // Import toast

export function NavUser() {
  const { data: session, status } = useSession() 
  const user = session?.user
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      const res = await signOutAction()
      if (res.success) {
        toast.success("Logged out successfully!")
        router.replace("/login")
      } else {
        console.error(res.error)
        toast.error("Logout failed. Please try again.") 
      }
    })
  }

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {status === "loading" ? null : !user ? (
          <SidebarMenuButton
            onClick={handleLogin}
            size="default"
            className="cursor-pointer justify-center font-semibold bg-sky-500 text-white hover:bg-sky-600 hover:text-white transition-colors duration-200"
          >
            <IconLogin />
            <span>Login</span>
          </SidebarMenuButton>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="cursor-pointer">
                <IconLogout />
                {isPending ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
