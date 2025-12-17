"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { type SalesWithCalculations, type Outlet, insertSalesSchema, type InsertSales } from "@shared/schema";
import { MetricCard } from "@/components/metric-card";
import { WhatsAppSummary } from "@/components/whatsapp-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, TrendingUp, Package, Clock, Loader2, Calendar, 
  Edit, CreditCard, Smartphone, ShoppingBag
} from "lucide-react";
import { SiGrab, SiGojek, SiShopee, SiTiktok } from "react-icons/si";

function DashboardHarianContent() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesWithCalculations | null>(null);

  const { data: outlets, isLoading: outletsLoading } = useQuery<Outlet[]>({
    queryKey: ["/outlets"],
  });

  const { data: allSales, isLoading: salesLoading, error: salesError } = useQuery<
    SalesWithCalculations[]
  >({
    queryKey: ["/sales", { date: selectedDate }],
  });

  const editForm = useForm<InsertSales>({
    resolver: zodResolver(insertSalesSchema),
    defaultValues: {
      outletId: "",
      date: selectedDate,
      cash: 0,
      qris: 0,
      grab: 0,
      gofood: 0,
      shopee: 0,
      tiktok: 0,
      totalSold: 0,
      remaining: 0,
      returned: 0,
      totalProduction: 0,
      soldOutTime: "",
    },
  });

  const updateSalesMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSales> }) => {
      return await apiRequest("PATCH", `/sales/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Data penjualan berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/sales"] });
      setIsEditDialogOpen(false);
      setEditingSale(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui data",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const { data: mtdSales } = useQuery<SalesWithCalculations[]>({
    queryKey: ["/sales/mtd", { date: selectedDate, outletId: selectedOutlet }],
  });

  const mtdTotals = mtdSales?.reduce(
    (acc, sale) => ({
      grossMargin: acc.grossMargin + sale.grossMargin,
      sold: acc.sold + sale.totalSold,
    }),
    { grossMargin: 0, sold: 0 }
  ) || { grossMargin: 0, sold: 0 };

  const selectedSale = filteredSales?.find((s) => s.outletId === selectedOutlet);

  const handleEditSale = (sale: SalesWithCalculations) => {
    setEditingSale(sale);
    editForm.reset({
      outletId: sale.outletId,
      date: sale.date,
      cash: sale.cash,
      qris: sale.qris,
      grab: sale.grab,
      gofood: sale.gofood,
      shopee: sale.shopee,
      tiktok: sale.tiktok,
      totalSold: sale.totalSold,
      remaining: sale.remaining,
      returned: sale.returned,
      totalProduction: sale.totalProduction,
      soldOutTime: sale.soldOutTime || "",
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (data: InsertSales) => {
    if (!editingSale) return;
    updateSalesMutation.mutate({ id: editingSale.id, data });
  };

  const formatInputValue = (value: number | undefined) => {
    if (!value || value === 0) return "";
    return value.toLocaleString("id-ID");
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof InsertSales
  ) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    editForm.setValue(field, val === "" ? 0 : parseInt(val));
  };

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
                    <TableHead className="text-center font-semibold w-20">Aksi</TableHead>
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
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSale(sale)}
                          data-testid={`button-edit-sale-${sale.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Penjualan</DialogTitle>
            <DialogDescription>
              {editingSale && (
                <span className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{editingSale.outletName}</Badge>
                  <Badge variant="secondary">{format(new Date(editingSale.date), "d MMMM yyyy", { locale: localeId })}</Badge>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pendapatan per Channel
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="cash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3" /> Cash
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(field.value)}
                              onChange={(e) => handleCurrencyChange(e, "cash")}
                              className="pl-8 text-right font-mono"
                              data-testid="input-edit-cash"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="qris"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Smartphone className="h-3 w-3" /> QRIS
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(field.value)}
                              onChange={(e) => handleCurrencyChange(e, "qris")}
                              className="pl-8 text-right font-mono"
                              data-testid="input-edit-qris"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="grab"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <SiGrab className="h-3 w-3 text-green-600" /> Grab
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(field.value)}
                              onChange={(e) => handleCurrencyChange(e, "grab")}
                              className="pl-8 text-right font-mono"
                              data-testid="input-edit-grab"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="gofood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <SiGojek className="h-3 w-3 text-green-700" /> GoFood
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(field.value)}
                              onChange={(e) => handleCurrencyChange(e, "gofood")}
                              className="pl-8 text-right font-mono"
                              data-testid="input-edit-gofood"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="shopee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <SiShopee className="h-3 w-3 text-orange-500" /> Shopee
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(field.value)}
                              onChange={(e) => handleCurrencyChange(e, "shopee")}
                              className="pl-8 text-right font-mono"
                              data-testid="input-edit-shopee"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <SiTiktok className="h-3 w-3" /> TikTok
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(field.value)}
                              onChange={(e) => handleCurrencyChange(e, "tiktok")}
                              className="pl-8 text-right font-mono"
                              data-testid="input-edit-tiktok"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Data Produksi & Penjualan
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={editForm.control}
                    name="totalProduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Produksi</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="font-mono"
                            data-testid="input-edit-production"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="totalSold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terjual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="font-mono"
                            data-testid="input-edit-sold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="remaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sisa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="font-mono"
                            data-testid="input-edit-remaining"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="returned"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="font-mono"
                            data-testid="input-edit-returned"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={editForm.control}
                name="soldOutTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Waktu Sold Out (opsional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        value={field.value || ""}
                        className="w-40"
                        data-testid="input-edit-soldout-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingSale(null);
                    editForm.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateSalesMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateSalesMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardHarianPage() {
  return (
    <AuthenticatedLayout>
      <DashboardHarianContent />
    </AuthenticatedLayout>
  );
}
