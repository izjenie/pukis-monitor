"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Loader2, ShieldAlert } from "lucide-react";
import { useAuth, type User } from "@/hooks/use-auth";
import Link from "next/link";

type UserRole = "super_admin" | "owner" | "admin_outlet" | "finance";

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    super_admin: "Super Admin",
    owner: "Owner",
    admin_outlet: "Admin Outlet",
    finance: "Finance",
  };
  return roleMap[role] || role;
};

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function AuthenticatedLayout({ children, requiredRole }: AuthenticatedLayoutProps) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/20">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold tracking-tight">Pukis Monitoring</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Sistem monitoring penjualan dan pengeluaran untuk outlet Pukis
          </p>
          <div className="flex flex-col gap-3 items-center">
            <Link href="/api/auth/login">
              <Button size="lg" className="min-w-[200px]" data-testid="button-login">
                Masuk dengan Replit
              </Button>
            </Link>
            <Link href="/admin-login">
              <Button variant="outline" size="lg" className="min-w-[200px]" data-testid="button-admin-login">
                Login Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/20">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-8 gap-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <h2 className="text-xl font-bold">Akses Ditolak</h2>
            <p className="text-center text-muted-foreground">
              Anda tidak memiliki akses ke halaman ini. 
              Halaman ini memerlukan role <span className="font-semibold">{getRoleLabel(requiredRole)}</span>.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-2">
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const getUserInitials = () => {
    const firstName = user.first_name;
    const lastName = user.last_name;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold">Pukis Monitoring</div>
                <div className="text-xs text-muted-foreground">
                  Dashboard Penjualan
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profile_image_url || undefined} alt={user.email || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getRoleLabel(user.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer" data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
