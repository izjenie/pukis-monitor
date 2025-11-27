"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOutletSchema, type InsertOutlet, type Outlet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Plus, Store, Edit, Loader2, DollarSign, Trash2 } from "lucide-react";

function OutletsContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingOutlet, setDeletingOutlet] = useState<Outlet | null>(null);

  const { data: outlets, isLoading } = useQuery<Outlet[]>({
    queryKey: ["/api/outlets"],
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
      return await apiRequest("POST", "/api/outlets", data);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Outlet berhasil ditambahkan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outlets"] });
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
      return await apiRequest("PATCH", `/api/outlets/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Outlet berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outlets"] });
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
      return await apiRequest("DELETE", `/api/outlets/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Outlet berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outlets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
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
            Kelola outlet dan COGS per piece
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
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

      {outlets && outlets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Outlet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nama Outlet</TableHead>
                    <TableHead className="text-right font-semibold">
                      COGS per Piece
                    </TableHead>
                    <TableHead className="text-right font-semibold w-32">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outlets.map((outlet) => (
                    <TableRow key={outlet.id} data-testid={`row-outlet-${outlet.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          {outlet.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">
                            {formatCurrency(outlet.cogsPerPiece)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(outlet)}
                            className="gap-2"
                            data-testid={`button-edit-${outlet.id}`}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(outlet)}
                            className="gap-2 text-destructive hover:text-destructive"
                            data-testid={`button-delete-${outlet.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
              Tindakan ini tidak dapat dibatalkan. Semua data penjualan dan pengeluaran 
              yang terkait dengan outlet ini akan tetap ada, namun outlet tidak akan 
              muncul dalam pilihan input data baru.
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
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function OutletsPage() {
  return (
    <AuthenticatedLayout>
      <OutletsContent />
    </AuthenticatedLayout>
  );
}
