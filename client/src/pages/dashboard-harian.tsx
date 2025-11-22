import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { type SalesWithCalculations, type Outlet } from "@shared/schema";
import { MetricCard } from "@/components/metric-card";
import { WhatsAppSummary } from "@/components/whatsapp-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Package, Clock, Loader2, Calendar } from "lucide-react";

export default function DashboardHarian() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");

  const { data: outlets, isLoading: outletsLoading } = useQuery<Outlet[]>({
    queryKey: ["/api/outlets"],
  });

  const { data: allSales, isLoading: salesLoading, error: salesError } = useQuery<
    SalesWithCalculations[]
  >({
    queryKey: ["/api/sales", { date: selectedDate }],
  });

  const isLoading = outletsLoading || salesLoading;

  const filteredSales =
    selectedOutlet === "all"
      ? allSales
      : allSales?.filter((s) => s.outletId === selectedOutlet);

  const dailyTotals = filteredSales?.reduce(
    (acc, sale) => ({
      revenue: acc.revenue + sale.totalRevenue,
      sold: acc.sold + sale.totalSold,
      grossMargin: acc.grossMargin + sale.grossMargin,
    }),
    { revenue: 0, sold: 0, grossMargin: 0 }
  ) || { revenue: 0, sold: 0, grossMargin: 0 };

  const avgGMPercentage =
    dailyTotals.revenue > 0
      ? (dailyTotals.grossMargin / dailyTotals.revenue) * 100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMTDPeriod = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (day >= 10) {
      const start = new Date(year, month, 10);
      const end = new Date(year, month + 1, 9);
      return {
        start: format(start, "d MMM", { locale: localeId }),
        end: format(end, "d MMM", { locale: localeId }),
      };
    } else {
      const start = new Date(year, month - 1, 10);
      const end = new Date(year, month, 9);
      return {
        start: format(start, "d MMM", { locale: localeId }),
        end: format(end, "d MMM", { locale: localeId }),
      };
    }
  };

  const currentDate = new Date(selectedDate);
  const mtdPeriod = getMTDPeriod(currentDate);

  const { data: mtdSales, error: mtdError } = useQuery<SalesWithCalculations[]>({
    queryKey: ["/api/sales/mtd", { date: selectedDate, outletId: selectedOutlet }],
  });

  const mtdTotals = mtdSales?.reduce(
    (acc, sale) => ({
      grossMargin: acc.grossMargin + sale.grossMargin,
      sold: acc.sold + sale.totalSold,
    }),
    { grossMargin: 0, sold: 0 }
  ) || { grossMargin: 0, sold: 0 };

  const selectedSale = filteredSales?.find((s) => s.outletId === selectedOutlet);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (salesError) {
    return (
      <div className="p-4 md:p-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Package className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-destructive">
                Gagal memuat data
              </h3>
              <p className="text-sm text-muted-foreground">
                {salesError instanceof Error ? salesError.message : "Terjadi kesalahan saat memuat data penjualan"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard Harian</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring performa penjualan harian outlet
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="date-filter" className="text-xs">
              Tanggal
            </Label>
            <Input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="min-h-10"
              data-testid="input-filter-date"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="outlet-filter" className="text-xs">
              Outlet
            </Label>
            <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
              <SelectTrigger className="min-h-10 w-full sm:w-48" data-testid="select-filter-outlet">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Outlet</SelectItem>
                {outlets?.map((outlet) => (
                  <SelectItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-medium">Periode MTD:</span>
        <Badge variant="outline" className="font-mono">
          {mtdPeriod.start} – {mtdPeriod.end}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pendapatan Total"
          value={formatCurrency(dailyTotals.revenue)}
          icon={DollarSign}
          testId="metric-total-revenue"
        />
        <MetricCard
          title="Pukis Terjual"
          value={`${dailyTotals.sold} pcs`}
          icon={Package}
          testId="metric-total-sold"
        />
        <MetricCard
          title="Gross Margin"
          value={formatCurrency(dailyTotals.grossMargin)}
          subtitle={`${avgGMPercentage.toFixed(1)}%`}
          icon={TrendingUp}
          valueClassName={dailyTotals.grossMargin >= 0 ? "text-primary" : "text-destructive"}
          testId="metric-gross-margin"
        />
        <MetricCard
          title="Sold Out Time"
          value={selectedSale?.soldOutTime || "–"}
          icon={Clock}
          testId="metric-sold-out-time"
        />
      </div>

      {filteredSales && filteredSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Outlet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Outlet</TableHead>
                    <TableHead className="text-right font-semibold">Pendapatan</TableHead>
                    <TableHead className="text-right font-semibold">Terjual</TableHead>
                    <TableHead className="text-right font-semibold">GM</TableHead>
                    <TableHead className="text-right font-semibold">GM %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} data-testid={`row-outlet-${sale.outletId}`}>
                      <TableCell className="font-medium">
                        {sale.outletName}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(sale.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {sale.totalSold} pcs
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(sale.grossMargin)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {sale.grossMarginPercentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedOutlet !== "all" && selectedSale && (
        <WhatsAppSummary
          outletName={selectedSale.outletName || ""}
          date={new Date(selectedDate)}
          totalRevenue={selectedSale.totalRevenue}
          totalSold={selectedSale.totalSold}
          cogsSold={selectedSale.cogsSold}
          grossMargin={selectedSale.grossMargin}
          grossMarginPercentage={selectedSale.grossMarginPercentage}
          mtdGrossMargin={mtdTotals.grossMargin}
          mtdTotalSold={mtdTotals.sold}
          soldOutTime={selectedSale.soldOutTime || undefined}
          periodStart={mtdPeriod.start}
          periodEnd={mtdPeriod.end}
        />
      )}

      {(!filteredSales || filteredSales.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Package className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Belum ada data</h3>
              <p className="text-sm text-muted-foreground">
                Belum ada data penjualan untuk tanggal yang dipilih
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
