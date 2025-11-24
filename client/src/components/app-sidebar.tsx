import { Home, TrendingUp, Calendar, Store, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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

export function AppSidebar() {
  const [location] = useLocation();

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
                    isActive={location === item.url}
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
      </SidebarContent>
    </Sidebar>
  );
}
