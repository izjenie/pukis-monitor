// Landing page for unauthenticated users
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLine, Store, FileText, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Pukis Monitoring
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistem monitoring penjualan harian untuk semua outlet Pukis Anda
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Input Penjualan
              </CardTitle>
              <CardDescription>
                Catat penjualan harian dari berbagai metode pembayaran
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="h-5 w-5 text-primary" />
                Dashboard & Analitik
              </CardTitle>
              <CardDescription>
                Lihat performa harian dan MTD dengan visualisasi lengkap
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Multi-Outlet
              </CardTitle>
              <CardDescription>
                Kelola multiple outlet dengan COGS yang berbeda
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Role-Based Access
              </CardTitle>
              <CardDescription>
                Kontrol akses berdasarkan peran: Owner, Admin Outlet, Finance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Button */}
        <div className="flex justify-center pt-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Siap untuk memulai?</CardTitle>
              <CardDescription>
                Masuk untuk mengakses dashboard monitoring Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                onClick={handleLogin}
                size="lg"
                className="w-full"
                data-testid="button-login"
              >
                Masuk ke Aplikasi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
