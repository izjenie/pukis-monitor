import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSalesSchema, type InsertSales, type Outlet, type InsertExpense } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/currency-input";
import { NumberInput } from "@/components/number-input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Wallet, Smartphone, ShoppingBag, Store as StoreIcon, Plus, Trash2, Receipt } from "lucide-react";
import { format } from "date-fns";
import { SiGrab, SiShopee, SiTiktok } from "react-icons/si";

interface DailyExpense {
  id: string;
  description: string;
  amount: number;
}

export default function SalesInput() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);

  const { data: outlets, isLoading: outletsLoading } = useQuery<Outlet[]>({
    queryKey: ["/api/outlets"],
  });

  const form = useForm<InsertSales>({
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

  const createSalesMutation = useMutation({
    mutationFn: async (data: InsertSales) => {
      return await apiRequest("POST", "/api/sales", data);
    },
  });

  useEffect(() => {
    form.setValue("date", selectedDate);
  }, [selectedDate, form]);

  const onSubmit = async (data: InsertSales) => {
    if (!data.outletId) {
      toast({
        title: "Outlet belum dipilih",
        description: "Silakan pilih outlet terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (data.totalProduction < data.totalSold) {
      toast({
        title: "Validasi gagal",
        description: "Total produksi harus >= total terjual",
        variant: "destructive",
      });
      return;
    }

    try {
      const sale: any = await createSalesMutation.mutateAsync(data);
      const createdExpenseIds: string[] = [];

      if (dailyExpenses.length > 0) {
        try {
          for (const expense of dailyExpenses) {
            const expenseData: InsertExpense = {
              outletId: data.outletId,
              date: selectedDate,
              type: "harian",
              description: expense.description,
              amount: expense.amount,
            };
            const createdExpense: any = await apiRequest("POST", "/api/expenses", expenseData);
            createdExpenseIds.push(createdExpense.id);
          }
        } catch (expenseError) {
          try {
            await apiRequest("DELETE", `/api/sales/${sale.id}`);
          } catch (saleDeleteError) {
            console.error("Failed to delete sale during rollback:", saleDeleteError);
          }
          
          for (const expenseId of createdExpenseIds) {
            try {
              await apiRequest("DELETE", `/api/expenses/${expenseId}`);
            } catch (expenseDeleteError) {
              console.error("Failed to delete expense during rollback:", expenseDeleteError);
            }
          }

          queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
          queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
          
          toast({
            title: "Gagal menyimpan",
            description: "Gagal menyimpan pengeluaran. Rollback dilakukan, silakan periksa data Anda.",
            variant: "destructive",
          });
          return;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });

      toast({
        title: "Berhasil!",
        description: dailyExpenses.length > 0 
          ? "Data penjualan dan pengeluaran berhasil disimpan"
          : "Data penjualan berhasil disimpan",
      });

      form.reset({
        outletId: form.getValues("outletId"),
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
      });
      setDailyExpenses([]);
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  };

  const totalRevenue =
    (form.watch("cash") || 0) +
    (form.watch("qris") || 0) +
    (form.watch("grab") || 0) +
    (form.watch("gofood") || 0) +
    (form.watch("shopee") || 0) +
    (form.watch("tiktok") || 0);

  const addExpense = () => {
    setDailyExpenses([
      ...dailyExpenses,
      { id: crypto.randomUUID(), description: "", amount: 0 },
    ]);
  };

  const removeExpense = (id: string) => {
    setDailyExpenses(dailyExpenses.filter((exp) => exp.id !== id));
  };

  const updateExpense = (id: string, field: "description" | "amount", value: string | number) => {
    setDailyExpenses(
      dailyExpenses.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const totalExpenses = dailyExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  if (outletsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!outlets || outlets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <StoreIcon className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Belum ada outlet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Silakan tambahkan outlet terlebih dahulu di menu Kelola Outlet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Input Penjualan Harian</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan data penjualan harian outlet Anda
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="outletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outlet</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      data-testid="select-outlet"
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-12">
                          <SelectValue placeholder="Pilih outlet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outlets.map((outlet) => (
                          <SelectItem
                            key={outlet.id}
                            value={outlet.id}
                            data-testid={`option-outlet-${outlet.id}`}
                          >
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
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedDate(e.target.value);
                        }}
                        className="min-h-12"
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-accent/30 border-accent">
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cash"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Cash"
                      value={field.value}
                      onChange={field.onChange}
                      testId="input-cash"
                      icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qris"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="QRIS"
                      value={field.value}
                      onChange={field.onChange}
                      testId="input-qris"
                      icon={<Smartphone className="h-5 w-5 text-muted-foreground" />}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grab"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Grab"
                      value={field.value}
                      onChange={field.onChange}
                      testId="input-grab"
                      icon={<SiGrab className="h-5 w-5 text-muted-foreground" />}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gofood"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="GoFood"
                      value={field.value}
                      onChange={field.onChange}
                      testId="input-gofood"
                      icon={<ShoppingBag className="h-5 w-5 text-muted-foreground" />}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shopee"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="Shopee"
                      value={field.value}
                      onChange={field.onChange}
                      testId="input-shopee"
                      icon={<SiShopee className="h-5 w-5 text-muted-foreground" />}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok"
                render={({ field }) => (
                  <FormItem>
                    <CurrencyInput
                      label="TikTok"
                      value={field.value}
                      onChange={field.onChange}
                      testId="input-tiktok"
                      icon={<SiTiktok className="h-5 w-5 text-muted-foreground" />}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Pendapatan
                  </span>
                  <span className="text-xl font-bold font-mono text-primary" data-testid="text-total-revenue">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(totalRevenue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Produksi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalSold"
                render={({ field }) => (
                  <FormItem>
                    <NumberInput
                      label="Total Terjual"
                      value={field.value}
                      onChange={field.onChange}
                      suffix="pcs"
                      testId="input-total-sold"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remaining"
                render={({ field }) => (
                  <FormItem>
                    <NumberInput
                      label="Sisa"
                      value={field.value}
                      onChange={field.onChange}
                      suffix="pcs"
                      testId="input-remaining"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returned"
                render={({ field }) => (
                  <FormItem>
                    <NumberInput
                      label="Return"
                      value={field.value}
                      onChange={field.onChange}
                      suffix="pcs"
                      testId="input-returned"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalProduction"
                render={({ field }) => (
                  <FormItem>
                    <NumberInput
                      label="Total Produksi"
                      value={field.value}
                      onChange={field.onChange}
                      suffix="pcs"
                      testId="input-total-production"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soldOutTime"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Jam Sold Out (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        value={field.value || ""}
                        className="min-h-12 font-mono"
                        data-testid="input-sold-out-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Pengeluaran Harian (Opsional)</CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExpense}
                data-testid="button-add-expense-item"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada pengeluaran. Klik "Tambah" untuk menambahkan pengeluaran harian.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {dailyExpenses.map((expense, index) => (
                      <div
                        key={expense.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr,200px,auto] gap-3 p-3 border rounded-lg"
                        data-testid={`expense-item-${index}`}
                      >
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            Deskripsi
                          </label>
                          <Input
                            placeholder="Misal: Listrik, Air, Gas, dll"
                            value={expense.description}
                            onChange={(e) =>
                              updateExpense(expense.id, "description", e.target.value)
                            }
                            className="min-h-10"
                            data-testid={`input-expense-description-${index}`}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">
                            Jumlah
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={expense.amount || ""}
                            onChange={(e) =>
                              updateExpense(
                                expense.id,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="min-h-10 font-mono"
                            data-testid={`input-expense-amount-${index}`}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExpense(expense.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-remove-expense-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Pengeluaran
                    </span>
                    <span className="text-lg font-bold font-mono text-destructive" data-testid="text-total-expenses">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(totalExpenses)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full min-h-12 text-base font-semibold"
            disabled={createSalesMutation.isPending}
            data-testid="button-submit-sales"
          >
            {createSalesMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Data Penjualan"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
