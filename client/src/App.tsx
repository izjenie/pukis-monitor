import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import SalesInput from "@/pages/sales-input";
import DashboardHarian from "@/pages/dashboard-harian";
import DashboardMTD from "@/pages/dashboard-mtd";
import Outlets from "@/pages/outlets";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SalesInput} />
      <Route path="/dashboard-harian" component={DashboardHarian} />
      <Route path="/dashboard-mtd" component={DashboardMTD} />
      <Route path="/outlets" component={Outlets} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold">Pukis Monitoring</div>
                    <div className="text-xs text-muted-foreground">
                      Dashboard Penjualan
                    </div>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
