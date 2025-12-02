"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/form";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { Plus, Loader2, Users, Trash2, Crown } from "lucide-react";

type Admin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role: string;
  assignedOutletId: string | null;
  createdAt: string;
};

const createAdminSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  firstName: z.string().min(1, "Nama harus diisi"),
  lastName: z.string().optional(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["owner", "admin_outlet", "finance"], {
    errorMap: () => ({ message: "Role harus dipilih" }),
  }),
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;

function AdminsContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);

  const { data: admins, isLoading, error } = useQuery<Admin[]>({
    queryKey: ["/api/super-admin/admins"],
  });

  const form = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: undefined,
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: CreateAdminForm) => {
      return await apiRequest("POST", "/api/super-admin/admins", data);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Admin berhasil dibuat",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/admins"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal membuat admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/super-admin/admins/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Admin berhasil dihapus",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/admins"] });
      setIsDeleteDialogOpen(false);
      setDeletingAdmin(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus admin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAdminForm) => {
    createAdminMutation.mutate(data);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  const handleDelete = (admin: Admin) => {
    setDeletingAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!deletingAdmin) return;
    
    try {
      await deleteAdminMutation.mutateAsync(deletingAdmin.id);
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: localeId });
    } catch {
      return dateStr;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin_outlet":
        return "secondary";
      case "finance":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "admin_outlet":
        return "Admin Outlet";
      case "finance":
        return "Finance";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Akses Ditolak</h3>
            <p className="text-sm text-muted-foreground">
              Halaman ini hanya dapat diakses oleh Super Admin
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manajemen Admin</h1>
          <p className="text-sm text-muted-foreground">
            Buat dan kelola admin pengguna sistem
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2"
          data-testid="button-add-admin"
        >
          <Plus className="h-4 w-4" />
          Buat Admin
        </Button>
      </div>

      {admins && admins.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                      <TableCell className="font-medium">
                        {admin.firstName} {admin.lastName || ""}
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(admin.role)}>
                          {getRoleLabel(admin.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(admin.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(admin)}
                          data-testid={`button-delete-admin-${admin.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Belum ada admin terdaftar</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Buat admin pertama untuk mulai mengelola sistem
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
                data-testid="button-add-first-admin"
              >
                <Plus className="h-4 w-4" />
                Buat Admin Pertama
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Admin Baru</DialogTitle>
            <DialogDescription>
              Masukkan informasi admin baru untuk sistem
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Admin</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nama lengkap admin"
                        className="min-h-12"
                        data-testid="input-admin-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Admin</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@example.com"
                        className="min-h-12"
                        data-testid="input-admin-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Admin</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Minimum 8 karakter"
                        className="min-h-12"
                        data-testid="input-admin-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="min-h-12"
                          data-testid="select-admin-role"
                        >
                          <SelectValue placeholder="Pilih role admin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin_outlet">Admin Outlet</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
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
                  disabled={createAdminMutation.isPending}
                  data-testid="button-save-admin"
                >
                  {createAdminMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus admin{" "}
              <span className="font-semibold">
                {deletingAdmin?.firstName} {deletingAdmin?.lastName || ""}
              </span>
              ?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteAdminMutation.isPending}
              data-testid="button-cancel-delete"
            >
              Batal
            </AlertDialogCancel>
            <Button
              onClick={confirmDelete}
              disabled={deleteAdminMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteAdminMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus Admin
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <AuthenticatedLayout requiredRole="super_admin">
      <AdminsContent />
    </AuthenticatedLayout>
  );
}
