"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { insertExpenseSchema, type InsertExpense, type SalesWithCalculations, type User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { 
  Plus, Pencil, Trash2, Receipt, CalendarRange, Store, 
  Calendar, DollarSign, TrendingUp, Package, Loader2, Minus,
  ArrowRight, Info, Banknote, FileImage, FileText, ExternalLink
} from "lucide-react";
import type { Outlet, ExpenseWithOutlet } from "@shared/schema";
import { ObjectUploader } from "@/components/object-uploader";

function ExpensesContent() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithOutlet | null>(null);

  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));

  const { data: user } = useQuery<User | null>({
    queryKey: ["/auth/user"],
    retry: false,
  });

  const canViewSalary = user?.role === "owner" || user?.role === "super_admin";

  const addForm = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      outletId: "",
      date: new Date().toISOString().split("T")[0],
      type: "harian",
      description: "",
      amount: 0,
      proofUrl: undefined,
    },
  });

  const editForm = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      outletId: "",
      date: new Date().toISOString().split("T")[0],
      type: "harian",
      description: "",
      amount: 0,
      proofUrl: undefined,
    },
  });

  const { data: outlets = [] } = useQuery<Outlet[]>({
    queryKey: ["/outlets"],
  });

  const shouldFetchDailyExpenses = selectedOutletId && selectedDate;
  const { data: dailyExpenses = [], isLoading: dailyLoading } = useQuery<ExpenseWithOutlet[]>({
    queryKey: ["/expenses", { 
      date: selectedDate, 
      outletId: selectedOutletId,
      type: "harian"
    }],
    enabled: !!shouldFetchDailyExpenses,
  });

  const monthStart = `${selectedMonth}-01`;
  const monthEnd = `${selectedMonth}-31`;
  const { data: monthlyExpenses = [], isLoading: monthlyLoading } = useQuery<ExpenseWithOutlet[]>({
    queryKey: ["/expenses", { 
      outletId: selectedOutletId === "" ? undefined : selectedOutletId,
      type: "bulanan"
    }],
  });

  const filteredMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.filter(expense => {
      const expenseMonth = expense.date.substring(0, 7);
      return expenseMonth === selectedMonth;
    });
  }, [monthlyExpenses, selectedMonth]);

  const { data: salaryExpenses = [], isLoading: salaryLoading } = useQuery<ExpenseWithOutlet[]>({
    queryKey: ["/expenses", { 
      outletId: selectedOutletId === "" ? undefined : selectedOutletId,
      type: "gaji"
    }],
    enabled: canViewSalary,
  });

  const filteredSalaryExpenses = useMemo(() => {
    return salaryExpenses.filter(expense => {
      const expenseMonth = expense.date.substring(0, 7);
      return expenseMonth === selectedMonth;
    });
  }, [salaryExpenses, selectedMonth]);

  const { data: salesData = [] } = useQuery<SalesWithCalculations[]>({
    queryKey: ["/sales", { date: selectedDate, outletId: selectedOutletId }],
    enabled: !!shouldFetchDailyExpenses,
  });

  const selectedOutlet = useMemo(() => {
    return outlets.find(o => o.id === selectedOutletId) || null;
  }, [outlets, selectedOutletId]);

  const dailyCalculation = useMemo(() => {
    if (!shouldFetchDailyExpenses || salesData.length === 0) return null;

    const sale = salesData[0];
    const totalRevenue = sale?.totalRevenue || 0;
    const totalSold = sale?.totalSold || 0;
    const cogsPerPiece = sale?.cogsPerPiece || selectedOutlet?.cogsPerPiece || 0;
    const cogsTotal = totalSold * cogsPerPiece;
    const totalDailyExpenses = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - cogsTotal - totalDailyExpenses;

    return {
      totalRevenue,
      totalSold,
      cogsPerPiece,
      cogsTotal,
      totalDailyExpenses,
      netProfit,
    };
  }, [shouldFetchDailyExpenses, salesData, dailyExpenses, selectedOutlet]);

  const createMutation = useMutation({
    mutationFn: (data: InsertExpense) => apiRequest("POST", "/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/expenses"] });
      toast({
        title: "Berhasil!",
        description: "Pengeluaran berhasil ditambahkan",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal menambahkan pengeluaran",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertExpense }) =>
      apiRequest("PATCH", `/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/expenses"] });
      toast({
        title: "Berhasil!",
        description: "Pengeluaran berhasil diupdate",
      });
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal mengupdate pengeluaran",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/expenses"] });
      toast({
        title: "Berhasil!",
        description: "Pengeluaran berhasil dihapus",
      });
      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal menghapus pengeluaran",
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: InsertExpense) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertExpense) => {
    if (!selectedExpense) return;
    updateMutation.mutate({ id: selectedExpense.id, data });
  };

  const openEditDialog = (expense: ExpenseWithOutlet) => {
    setSelectedExpense(expense);
    editForm.reset({
      outletId: expense.outletId,
      date: expense.date,
      type: expense.type,
      description: expense.description,
      amount: expense.amount,
      proofUrl: expense.proofUrl || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (expense: ExpenseWithOutlet) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: localeId });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Rekap Pengeluaran</h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengeluaran harian dan bulanan outlet
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-expense">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Pengeluaran Harian
          </CardTitle>
          <CardDescription>
            Pilih outlet dan tanggal untuk melihat pengeluaran harian
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily-outlet">Outlet</Label>
              <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                <SelectTrigger id="daily-outlet" data-testid="select-daily-outlet">
                  <SelectValue placeholder="Pilih Outlet" />
                </SelectTrigger>
                <SelectContent>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily-date">Tanggal</Label>
              <Input
                id="daily-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                data-testid="input-daily-date"
              />
            </div>
          </div>

          {!shouldFetchDailyExpenses ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
              <Info className="h-8 w-8 mb-2" />
              <p className="text-center">
                Pilih outlet dan tanggal untuk melihat pengeluaran harian
              </p>
            </div>
          ) : (
            <>
              {dailyCalculation && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Store className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{selectedOutlet?.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Pendapatan</p>
                        <p className="text-lg font-semibold font-mono">
                          {formatCurrency(dailyCalculation.totalRevenue)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Terjual</p>
                        <p className="text-lg font-semibold font-mono flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {dailyCalculation.totalSold} pcs
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">COGS (Rp {dailyCalculation.cogsPerPiece.toLocaleString()}/pcs)</p>
                        <p className="text-lg font-semibold font-mono text-orange-600">
                          - {formatCurrency(dailyCalculation.cogsTotal)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Pengeluaran Harian</p>
                        <p className="text-lg font-semibold font-mono text-red-600">
                          - {formatCurrency(dailyCalculation.totalDailyExpenses)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Laba Harian</p>
                        <p className={`text-lg font-bold font-mono ${
                          dailyCalculation.netProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(dailyCalculation.netProfit)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {dailyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : dailyExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg" data-testid="daily-empty-state">
                  Belum ada pengeluaran harian untuk tanggal ini
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-center w-16">Bukti</TableHead>
                        <TableHead className="text-center w-24">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyExpenses.map((expense) => (
                        <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                          <TableCell data-testid={`text-description-${expense.id}`}>
                            {expense.description}
                          </TableCell>
                          <TableCell className="text-right font-medium font-mono" data-testid={`text-amount-${expense.id}`}>
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            {expense.proofUrl ? (
                              <a
                                href={expense.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
                                data-testid={`link-proof-${expense.id}`}
                              >
                                <FileImage className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(expense)}
                                data-testid={`button-edit-${expense.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(expense)}
                                data-testid={`button-delete-${expense.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-purple-600" />
            Pengeluaran Bulanan
          </CardTitle>
          <CardDescription>
            Pengeluaran tetap bulanan (gaji, sewa, dll)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-outlet">Filter Outlet</Label>
              <Select 
                value={selectedOutletId || "all"} 
                onValueChange={(v) => setSelectedOutletId(v === "all" ? "" : v)}
              >
                <SelectTrigger id="monthly-outlet" data-testid="select-monthly-outlet">
                  <SelectValue placeholder="Semua Outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Outlet</SelectItem>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-month">Bulan</Label>
              <Input
                id="monthly-month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                data-testid="input-monthly-month"
              />
            </div>
          </div>

          {monthlyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMonthlyExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg" data-testid="monthly-empty-state">
              Belum ada pengeluaran bulanan untuk bulan ini
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <Badge variant="secondary" className="font-mono">
                  Total: {formatCurrency(filteredMonthlyExpenses.reduce((sum, e) => sum + e.amount, 0))}
                </Badge>
              </div>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-center w-16">Bukti</TableHead>
                      <TableHead className="text-center w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonthlyExpenses.map((expense) => (
                      <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                        <TableCell data-testid={`text-date-${expense.id}`}>
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell data-testid={`text-outlet-${expense.id}`}>
                          {expense.outletName || "-"}
                        </TableCell>
                        <TableCell data-testid={`text-description-${expense.id}`}>
                          {expense.description}
                        </TableCell>
                        <TableCell className="text-right font-medium font-mono" data-testid={`text-amount-${expense.id}`}>
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {expense.proofUrl ? (
                            <a
                              href={expense.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
                              data-testid={`link-proof-${expense.id}`}
                            >
                              <FileImage className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(expense)}
                              data-testid={`button-edit-${expense.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(expense)}
                              data-testid={`button-delete-${expense.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {canViewSalary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              Pengeluaran Gaji
            </CardTitle>
            <CardDescription>
              Pengeluaran gaji karyawan (hanya Owner yang dapat melihat)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary-outlet">Filter Outlet</Label>
                <Select 
                  value={selectedOutletId || "all"} 
                  onValueChange={(v) => setSelectedOutletId(v === "all" ? "" : v)}
                >
                  <SelectTrigger id="salary-outlet" data-testid="select-salary-outlet">
                    <SelectValue placeholder="Semua Outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Outlet</SelectItem>
                    {outlets.map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-month">Bulan</Label>
                <Input
                  id="salary-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  data-testid="input-salary-month"
                />
              </div>
            </div>

            {salaryLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSalaryExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg" data-testid="salary-empty-state">
                Belum ada pengeluaran gaji untuk bulan ini
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Badge variant="secondary" className="font-mono bg-green-100 dark:bg-green-900/30">
                    Total Gaji: {formatCurrency(filteredSalaryExpenses.reduce((sum, e) => sum + e.amount, 0))}
                  </Badge>
                </div>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Outlet</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-center w-16">Bukti</TableHead>
                        <TableHead className="text-center w-24">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalaryExpenses.map((expense) => (
                        <TableRow key={expense.id} data-testid={`row-salary-${expense.id}`}>
                          <TableCell data-testid={`text-salary-date-${expense.id}`}>
                            {formatDate(expense.date)}
                          </TableCell>
                          <TableCell data-testid={`text-salary-outlet-${expense.id}`}>
                            {expense.outletName || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-salary-description-${expense.id}`}>
                            {expense.description}
                          </TableCell>
                          <TableCell className="text-right font-medium font-mono text-green-600" data-testid={`text-salary-amount-${expense.id}`}>
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            {expense.proofUrl ? (
                              <a
                                href={expense.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
                                data-testid={`link-salary-proof-${expense.id}`}
                              >
                                <FileImage className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(expense)}
                                data-testid={`button-edit-salary-${expense.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(expense)}
                                data-testid={`button-delete-salary-${expense.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengeluaran</DialogTitle>
            <DialogDescription>
              Masukkan detail pengeluaran baru
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="outletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outlet *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-add-outlet">
                          <SelectValue placeholder="Pilih Outlet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outlets.map((outlet) => (
                          <SelectItem key={outlet.id} value={outlet.id}>
                            {outlet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-add-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-add-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="harian">Harian</SelectItem>
                        <SelectItem value="bulanan">Bulanan</SelectItem>
                        {canViewSalary && (
                          <SelectItem value="gaji">Gaji</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Contoh: Listrik, Gas, Gaji karyawan"
                        data-testid="input-add-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                        }}
                        placeholder="0"
                        data-testid="input-add-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="proofUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bukti Pengeluaran</FormLabel>
                    <FormControl>
                      <ObjectUploader
                        onUploadComplete={(url) => field.onChange(url)}
                        currentFileUrl={field.value}
                        onRemove={() => field.onChange(undefined)}
                        buttonText="+ Upload Bukti"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    addForm.reset();
                  }}
                  data-testid="button-cancel-add"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-add"
                >
                  {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengeluaran</DialogTitle>
            <DialogDescription>
              Ubah detail pengeluaran
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="outletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outlet *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-edit-outlet">
                          <SelectValue placeholder="Pilih Outlet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outlets.map((outlet) => (
                          <SelectItem key={outlet.id} value={outlet.id}>
                            {outlet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="input-edit-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="harian">Harian</SelectItem>
                        <SelectItem value="bulanan">Bulanan</SelectItem>
                        {canViewSalary && (
                          <SelectItem value="gaji">Gaji</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Contoh: Listrik, Gas, Gaji karyawan"
                        data-testid="input-edit-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? 0 : parseFloat(val) || 0);
                        }}
                        placeholder="0"
                        data-testid="input-edit-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="proofUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bukti Pengeluaran</FormLabel>
                    <FormControl>
                      <ObjectUploader
                        onUploadComplete={(url) => field.onChange(url)}
                        currentFileUrl={field.value}
                        onRemove={() => field.onChange(undefined)}
                        buttonText="+ Upload Bukti"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedExpense(null);
                    editForm.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengeluaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedExpense && deleteMutation.mutate(selectedExpense.id)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <AuthenticatedLayout>
      <ExpensesContent />
    </AuthenticatedLayout>
  );
}
