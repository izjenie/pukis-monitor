import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Filter, Receipt, CalendarRange } from "lucide-react";
import type { Outlet, ExpenseWithOutlet } from "@shared/schema";

export default function Expenses() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithOutlet | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterOutletId, setFilterOutletId] = useState<string>("all");

  // Forms
  const addForm = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      outletId: "",
      date: new Date().toISOString().split("T")[0],
      type: "harian",
      description: "",
      amount: 0,
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
    },
  });

  const { data: outlets = [] } = useQuery<Outlet[]>({
    queryKey: ["/api/outlets"],
  });

  const { data: expenses = [], isLoading } = useQuery<ExpenseWithOutlet[]>({
    queryKey: ["/api/expenses", { 
      date: filterDate, 
      outletId: filterOutletId === "all" ? undefined : filterOutletId
    }],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertExpense) => apiRequest("POST", "/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
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
      apiRequest("PATCH", `/api/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
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
    mutationFn: (id: string) => apiRequest("DELETE", `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
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

  const dailyExpenses = expenses.filter((exp) => exp.type === "harian");
  const monthlyExpenses = expenses.filter((exp) => exp.type === "bulanan");

  const renderExpenseTable = (expenses: typeof dailyExpenses, type: "harian" | "bulanan", testIdPrefix: string) => {
    if (isLoading) {
      return <div className="text-center py-8" data-testid={`${testIdPrefix}-loading-state`}>Loading...</div>;
    }
    
    if (expenses.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground" data-testid={`${testIdPrefix}-empty-state`}>
          Belum ada data pengeluaran {type === "harian" ? "harian" : "bulanan"}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                <TableCell data-testid={`text-date-${expense.id}`}>{expense.date}</TableCell>
                <TableCell data-testid={`text-outlet-${expense.id}`}>{expense.outletName || "-"}</TableCell>
                <TableCell data-testid={`text-description-${expense.id}`}>{expense.description}</TableCell>
                <TableCell className="text-right font-medium font-mono" data-testid={`text-amount-${expense.id}`}>
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
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
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rekap Pengeluaran</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-expense">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-date">Tanggal</Label>
              <Input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                data-testid="input-filter-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-outlet">Outlet</Label>
              <Select value={filterOutletId} onValueChange={setFilterOutletId}>
                <SelectTrigger id="filter-outlet" data-testid="select-filter-outlet">
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
          </div>
        </CardContent>
      </Card>

      {/* Daily Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Pengeluaran Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderExpenseTable(dailyExpenses, "harian", "daily")}
        </CardContent>
      </Card>

      {/* Monthly Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-purple-600" />
            Pengeluaran Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderExpenseTable(monthlyExpenses, "bulanan", "monthly")}
        </CardContent>
      </Card>

      {/* Add Dialog */}
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-add-amount"
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

      {/* Edit Dialog */}
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
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-edit-amount"
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

      {/* Delete Confirmation Dialog */}
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
