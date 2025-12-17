"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { insertOutletSchema, type InsertOutlet, type Outlet, type SalesWithCalculations } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { 
  Plus, Store, Edit, Loader2, DollarSign, Trash2, 
  TrendingUp, Package, Receipt, Calendar, ChevronDown,
  BarChart3, Minus
} from "lucide-react";

type OutletSummary = {
  outletId: string;
  outletName: string;
  cogsPerPiece: number;
  totalSold: number;
  totalRevenue: number;
  totalCogs: number;
  totalDailyExpenses: number;
  totalMonthlyExpenses: number;
  netProfit: number;
  periodStart: string;
  periodEnd: string;
};

function OutletsContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingOutlet, setDeletingOutlet] = useState<Outlet | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [viewingSalesOutlet, setViewingSalesOutlet] = useState<Outlet | null>(null);
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);
  const [isDeleteSalesDialogOpen, setIsDeleteSalesDialogOpen] = useState(false);
  const [deletingSale, setDeletingSale] = useState<SalesWithCalculations | null>(null);
  const [isDeleteAllSalesDialogOpen, setIsDeleteAllSalesDialogOpen] = useState(false);

  const { data: outlets, isLoading } = useQuery<Outlet[]>({
    queryKey: ["/outlets"],
  });

  const form = useForm<InsertOutlet>({
    resolver: zodResolver(insertOutletSchema),
    defaultValues: {
      name: "",
      cogsPerPiece: 0,
    },
  });

  const createOutletMutation = useMutation({
    mutationFn: async (data: InsertOutlet) => {
      return await apiRequest("POST", "/outlets", data);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Outlet berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/outlets"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingOutlet(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan outlet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOutletMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertOutlet }) => {
      return await apiRequest("PATCH", `/outlets/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Outlet berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/outlets"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingOutlet(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui outlet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteOutletMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/outlets/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Outlet dan semua datanya berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/outlets"] });
      queryClient.invalidateQueries({ queryKey: ["/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/expenses"] });
      setIsDeleteDialogOpen(false);
      setDeletingOutlet(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus outlet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/sales/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Data penjualan berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/outlets"] });
      queryClient.invalidateQueries({ queryKey: ["/sales"] });
      if (viewingSalesOutlet) {
        queryClient.invalidateQueries({ queryKey: [`/outlets/${viewingSalesOutlet.id}/sales`] });
        queryClient.invalidateQueries({ queryKey: [`/outlets/${viewingSalesOutlet.id}/summary`] });
      }
      setIsDeleteSalesDialogOpen(false);
      setDeletingSale(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus data penjualan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAllSalesMutation = useMutation({
    mutationFn: async (outletId: string) => {
      return await apiRequest("DELETE", `/outlets/${outletId}/sales`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Semua data penjualan outlet berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/outlets"] });
      queryClient.invalidateQueries({ queryKey: ["/sales"] });
      if (viewingSalesOutlet) {
        queryClient.invalidateQueries({ queryKey: [`/outlets/${viewingSalesOutlet.id}/sales`] });
        queryClient.invalidateQueries({ queryKey: [`/outlets/${viewingSalesOutlet.id}/summary`] });
      }
      setIsDeleteAllSalesDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus data penjualan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: outletSales, isLoading: salesLoading } = useQuery<SalesWithCalculations[]>({
    queryKey: [`/outlets/${viewingSalesOutlet?.id}/sales`],
    enabled: !!viewingSalesOutlet,
  });

  const onSubmit = (data: InsertOutlet) => {
    if (editingOutlet) {
      updateOutletMutation.mutate({ id: editingOutlet.id, data });
    } else {
      createOutletMutation.mutate(data);
    }
  };

  const handleEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    form.reset({
      name: outlet.name,
      cogsPerPiece: outlet.cogsPerPiece,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingOutlet(null);
    form.reset({
      name: "",
      cogsPerPiece: 0,
    });
  };

  const handleDelete = (outlet: Outlet) => {
    setDeletingOutlet(outlet);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!deletingOutlet) return;
    
    try {
      await deleteOutletMutation.mutateAsync(deletingOutlet.id);
    } catch (error) {
      console.error("Failed to delete outlet:", error);
    }
  };

  const handleViewSales = (outlet: Outlet) => {
    setViewingSalesOutlet(outlet);
    setIsSalesDialogOpen(true);
  };

  const handleDeleteSale = (sale: SalesWithCalculations) => {
    setDeletingSale(sale);
    setIsDeleteSalesDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCogsInput = (value: number | undefined) => {
    if (!value || value === 0) return "";
    return value.toLocaleString("id-ID");
  };

  const handleCogsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    form.setValue("cogsPerPiece", val === "" ? 0 : parseInt(val));
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: localeId });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kelola Outlet</h1>
          <p className="text-sm text-muted-foreground">
            Kelola outlet, COGS, dan ringkasan bulanan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="summary-date" className="text-xs">Periode</Label>
            <Input
              id="summary-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="min-h-10"
              data-testid="input-summary-date"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 self-end"
                data-testid="button-add-outlet"
              >
                <Plus className="h-4 w-4" />
                Tambah Outlet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingOutlet ? "Edit Outlet" : "Tambah Outlet Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingOutlet
                    ? "Perbarui informasi outlet"
                    : "Masukkan nama outlet dan COGS per piece"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Outlet</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Contoh: Pukis Kota Baru"
                            className="min-h-12"
                            data-testid="input-outlet-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cogsPerPiece"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>COGS per Piece</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                              Rp
                            </span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={formatCogsInput(field.value)}
                              onChange={handleCogsChange}
                              placeholder="0"
                              className="pl-10 text-right font-mono min-h-12"
                              data-testid="input-cogs"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Harga pokok produksi per piece pukis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                      data-testid="button-cancel"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createOutletMutation.isPending ||
                        updateOutletMutation.isPending
                      }
                      data-testid="button-save-outlet"
                    >
                      {(createOutletMutation.isPending ||
                        updateOutletMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingOutlet ? "Perbarui" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {outlets && outlets.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {outlets.map((outlet) => (
            <OutletCard
              key={outlet.id}
              outlet={outlet}
              selectedDate={selectedDate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewSales={handleViewSales}
              formatCurrency={formatCurrency}
            />
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <Store className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Belum ada outlet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tambahkan outlet pertama Anda untuk mulai monitoring penjualan
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
                data-testid="button-add-first-outlet"
              >
                <Plus className="h-4 w-4" />
                Tambah Outlet Pertama
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Outlet?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus outlet{" "}
              <span className="font-semibold">{deletingOutlet?.name}</span>?
              <br />
              <br />
              <span className="text-destructive font-medium">
                PERINGATAN: Semua data penjualan dan pengeluaran yang terkait 
                dengan outlet ini akan DIHAPUS PERMANEN.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteOutletMutation.isPending}
              data-testid="button-cancel-delete"
            >
              Batal
            </AlertDialogCancel>
            <Button
              onClick={confirmDelete}
              disabled={deleteOutletMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteOutletMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus Outlet & Semua Data
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSalesDialogOpen} onOpenChange={setIsSalesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Penjualan - {viewingSalesOutlet?.name}</DialogTitle>
            <DialogDescription>
              Kelola data penjualan outlet ini
            </DialogDescription>
          </DialogHeader>
          
          {salesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : outletSales && outletSales.length > 0 ? (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteAllSalesDialogOpen(true)}
                  data-testid="button-delete-all-sales"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua Data
                </Button>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Pendapatan</TableHead>
                      <TableHead className="text-right">Terjual</TableHead>
                      <TableHead className="text-right">Gross Margin</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outletSales.map((sale) => (
                      <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(sale.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {sale.totalSold} pcs
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(sale.grossMargin)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSale(sale)}
                            data-testid={`button-delete-sale-${sale.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data penjualan untuk outlet ini
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteSalesDialogOpen} onOpenChange={setIsDeleteSalesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Penjualan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data penjualan tanggal{" "}
              <span className="font-semibold">{deletingSale?.date}</span>?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSaleMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <Button
              onClick={() => deletingSale && deleteSaleMutation.mutate(deletingSale.id)}
              disabled={deleteSaleMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteSaleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteAllSalesDialogOpen} onOpenChange={setIsDeleteAllSalesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Data Penjualan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <span className="font-semibold text-destructive">SEMUA</span> data penjualan outlet{" "}
              <span className="font-semibold">{viewingSalesOutlet?.name}</span>?
              <br /><br />
              <span className="text-destructive font-medium">
                Tindakan ini tidak dapat dibatalkan!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAllSalesMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <Button
              onClick={() => viewingSalesOutlet && deleteAllSalesMutation.mutate(viewingSalesOutlet.id)}
              disabled={deleteAllSalesMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteAllSalesMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus Semua
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OutletCard({
  outlet,
  selectedDate,
  onEdit,
  onDelete,
  onViewSales,
  formatCurrency,
}: {
  outlet: Outlet;
  selectedDate: string;
  onEdit: (outlet: Outlet) => void;
  onDelete: (outlet: Outlet) => void;
  onViewSales: (outlet: Outlet) => void;
  formatCurrency: (amount: number) => string;
}) {
  const { data: summary, isLoading } = useQuery<OutletSummary>({
    queryKey: [`/outlets/${outlet.id}/summary`, { date: selectedDate }],
  });

  const formatPeriod = (start: string, end: string) => {
    try {
      const startDate = format(new Date(start), "d MMM", { locale: localeId });
      const endDate = format(new Date(end), "d MMM yyyy", { locale: localeId });
      return `${startDate} - ${endDate}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  return (
    <AccordionItem value={outlet.id} className="border rounded-lg">
      <Card className="border-0">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Store className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-lg truncate">{outlet.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  COGS: {formatCurrency(outlet.cogsPerPiece)}/pcs
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewSales(outlet)}
                data-testid={`button-view-sales-${outlet.id}`}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(outlet)}
                data-testid={`button-edit-${outlet.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(outlet)}
                className="text-destructive hover:text-destructive"
                data-testid={`button-delete-${outlet.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <AccordionTrigger className="px-6 py-2 hover:no-underline">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Ringkasan Periode MTD
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : summary ? (
              <div className="space-y-4">
                <Badge variant="outline" className="font-mono">
                  {formatPeriod(summary.periodStart, summary.periodEnd)}
                </Badge>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Terjual</p>
                    <p className="text-lg font-semibold font-mono flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {summary.totalSold} pcs
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Pendapatan</p>
                    <p className="text-lg font-semibold font-mono">
                      {formatCurrency(summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">COGS</p>
                    <p className="text-lg font-semibold font-mono text-orange-600">
                      {formatCurrency(summary.totalCogs)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Gross Margin</p>
                    <p className="text-lg font-semibold font-mono text-blue-600">
                      {formatCurrency(summary.totalRevenue - summary.totalCogs)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      Pengeluaran Harian
                    </span>
                    <span className="font-mono text-red-500">
                      - {formatCurrency(summary.totalDailyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Pengeluaran Bulanan
                    </span>
                    <span className="font-mono text-red-500">
                      - {formatCurrency(summary.totalMonthlyExpenses)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Laba Bersih (Net Profit)
                    </span>
                    <span className={`text-xl font-bold font-mono ${
                      summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {formatCurrency(summary.netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

export default function OutletsPage() {
  return (
    <AuthenticatedLayout>
      <OutletsContent />
    </AuthenticatedLayout>
  );
}
