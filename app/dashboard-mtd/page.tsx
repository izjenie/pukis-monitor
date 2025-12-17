"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { type MTDSummary, type Outlet } from "@shared/schema";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { DollarSign, TrendingUp, Package, Loader2, Calendar, Trophy } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function DashboardMTDContent() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const { data: outlets, isLoading: outletsLoading } = useQuery<Outlet[]>({
    queryKey: ["/outlets"],
  });

  const { data: mtdData, isLoading: mtdLoading, error: mtdError } = useQuery<MTDSummary[]>({
    queryKey: ["/sales/mtd-summary", { date: selectedDate }],
  });

  const isLoading = outletsLoading || mtdLoading;

  const getMTDPeriod = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (day >= 10) {
      const start = new Date(year, month, 10);
      const end = new Date(year, month + 1, 9);
      return {
        start: format(start, "d MMMM yyyy", { locale: localeId }),
        end: format(end, "d MMMM yyyy", { locale: localeId }),
        startShort: format(start, "d MMM", { locale: localeId }),
        endShort: format(end, "d MMM", { locale: localeId }),
      };
    } else {
      const start = new Date(year, month - 1, 10);
      const end = new Date(year, month, 9);
      return {
        start: format(start, "d MMMM yyyy", { locale: localeId }),
        end: format(end, "d MMMM yyyy", { locale: localeId }),
        startShort: format(start, "d MMM", { locale: localeId }),
        endShort: format(end, "d MMM", { locale: localeId }),
      };
    }
  };

  const currentDate = new Date(selectedDate);
  const mtdPeriod = getMTDPeriod(currentDate);

  const totalMTD = mtdData?.reduce(
    (acc, outlet) => ({
      revenue: acc.revenue + outlet.totalRevenue,
      sold: acc.sold + outlet.totalSold,
      grossMargin: acc.grossMargin + outlet.totalGrossMargin,
    }),
    { revenue: 0, sold: 0, grossMargin: 0 }
  ) || { revenue: 0, sold: 0, grossMargin: 0 };

  const avgGMPercentage =
    totalMTD.revenue > 0
      ? (totalMTD.grossMargin / totalMTD.revenue) * 100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const rankedOutlets = mtdData
    ?.map((outlet, index) => ({
      ...outlet,
      rank: index + 1,
    }))
    .sort((a, b) => b.totalGrossMargin - a.totalGrossMargin) || [];

  const chartData = mtdData?.[0]?.dailySales.map((day, index) => {
    const dataPoint: any = {
      date: format(new Date(day.date), "d MMM", { locale: localeId }),
    };

    mtdData.forEach((outlet) => {
      const sale = outlet.dailySales[index];
      if (sale) {
        dataPoint[outlet.outletName] = sale.revenue;
      }
    });

    return dataPoint;
  }) || [];

  const gmChartData = mtdData?.[0]?.dailySales.map((day, index) => {
    const dataPoint: any = {
      date: format(new Date(day.date), "d MMM", { locale: localeId }),
    };

    mtdData.forEach((outlet) => {
      const sale = outlet.dailySales[index];
      if (sale) {
        dataPoint[outlet.outletName] = sale.grossMargin;
      }
    });

    return dataPoint;
  }) || [];

  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mtdError) {
    return (
      <div className="p-4 md:p-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Calendar className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-destructive">
                Gagal memuat data MTD
              </h3>
              <p className="text-sm text-muted-foreground">
                {mtdError instanceof Error ? mtdError.message : "Terjadi kesalahan saat memuat data MTD"}
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard MTD</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring performa penjualan periode 10-10
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date-filter" className="text-xs">
            Pilih Tanggal (dalam periode MTD)
          </Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="min-h-10"
            data-testid="input-mtd-date"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-medium">Periode MTD:</span>
        <Badge variant="outline" className="font-mono">
          {mtdPeriod.startShort} – {mtdPeriod.endShort}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Pendapatan MTD"
          value={formatCurrency(totalMTD.revenue)}
          icon={DollarSign}
          testId="metric-mtd-revenue"
        />
        <MetricCard
          title="Total Pukis Terjual MTD"
          value={`${totalMTD.sold} pcs`}
          icon={Package}
          testId="metric-mtd-sold"
        />
        <MetricCard
          title="Total Gross Margin MTD"
          value={formatCurrency(totalMTD.grossMargin)}
          subtitle={`${avgGMPercentage.toFixed(1)}%`}
          icon={TrendingUp}
          valueClassName="text-primary"
          testId="metric-mtd-gm"
        />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik Pendapatan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                {mtdData?.map((outlet, index) => (
                  <Line
                    key={outlet.outletId}
                    type="monotone"
                    dataKey={outlet.outletName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {gmChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik Gross Margin Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gmChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                {mtdData?.map((outlet, index) => (
                  <Bar
                    key={outlet.outletId}
                    dataKey={outlet.outletName}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {rankedOutlets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Ranking Outlet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold w-16">Rank</TableHead>
                    <TableHead className="font-semibold">Outlet</TableHead>
                    <TableHead className="text-right font-semibold">Pendapatan</TableHead>
                    <TableHead className="text-right font-semibold">GM Total</TableHead>
                    <TableHead className="text-right font-semibold">GM %</TableHead>
                    <TableHead className="text-right font-semibold">Terjual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedOutlets.map((outlet, index) => (
                    <TableRow key={outlet.outletId} data-testid={`row-rank-${index + 1}`}>
                      <TableCell>
                        <Badge
                          variant={index === 0 ? "default" : "outline"}
                          className="font-mono"
                        >
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {outlet.outletName}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(outlet.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(outlet.totalGrossMargin)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {outlet.avgGrossMarginPercentage.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {outlet.totalSold} pcs
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {(!mtdData || mtdData.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Belum ada data MTD</h3>
              <p className="text-sm text-muted-foreground">
                Belum ada data penjualan untuk periode MTD yang dipilih
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DashboardMTDPage() {
  return (
    <AuthenticatedLayout>
      <DashboardMTDContent />
    </AuthenticatedLayout>
  );
}
