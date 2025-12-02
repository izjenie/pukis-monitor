"use client";

import { Home, TrendingUp, Calendar, Store, Wallet, Crown, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { User } from "@shared/schema";

const menuItems = [
  {
    title: "Input Penjualan",
    url: "/",
    icon: Home,
    testId: "link-sales-input",
  },
  {
    title: "Pengeluaran",
    url: "/expenses",
    icon: Wallet,
    testId: "link-expenses",
  },
  {
    title: "Dashboard Harian",
    url: "/dashboard-harian",
    icon: TrendingUp,
    testId: "link-daily-dashboard",
  },
  {
    title: "Dashboard MTD",
    url: "/dashboard-mtd",
    icon: Calendar,
    testId: "link-mtd-dashboard",
  },
  {
    title: "Kelola Outlet",
    url: "/outlets",
    icon: Store,
    testId: "link-outlets",
  },
];

const superAdminMenuItems = [
  {
    title: "Manajemen Admin",
    url: "/super-admin/admins",
    icon: Users,
    testId: "link-super-admin-admins",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary px-4 py-4">
            Pukis Monitoring
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isSuperAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-2 text-xs uppercase text-muted-foreground flex items-center gap-2">
                <Crown className="h-3 w-3" />
                Super Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {superAdminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        data-testid={item.testId}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
