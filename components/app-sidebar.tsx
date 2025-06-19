"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Users,
  Settings,
  FileText,
  MessageSquare,
  UserCog,
  LogOut,
  ChevronUp,
  User2,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manajemen Order",
    url: "/dashboard/orders",
    icon: Package,
  },
  {
    title: "Pembayaran",
    url: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Data Pelanggan",
    url: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Pengaturan Layanan",
    url: "/dashboard/services",
    icon: Settings,
  },
  {
    title: "Laporan",
    url: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Feedback Pelanggan",
    url: "/dashboard/feedback",
    icon: MessageSquare,
  },
  {
    title: "Manajemen Pegawai",
    url: "/dashboard/employees",
    icon: UserCog,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div
            className="bg-[#0F4C75] text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ minWidth: "200px", height: "40px" }}
          >
            Laundry Biner Admin
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Admin Laundry
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <span>Profil Admin</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
