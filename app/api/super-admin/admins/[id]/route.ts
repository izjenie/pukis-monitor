import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { storage } from "@/db/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya SUPER_ADMIN yang dapat menghapus admin." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const adminToDelete = await storage.getUser(id);
    if (!adminToDelete) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    if (adminToDelete.role === "super_admin") {
      return NextResponse.json(
        { error: "Tidak dapat menghapus SUPER_ADMIN" },
        { status: 400 }
      );
    }

    const deleted = await storage.deleteAdminUser(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Gagal menghapus admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Gagal menghapus admin" },
      { status: 500 }
    );
  }
}
