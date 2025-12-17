import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    const outlet = await storage.getOutlet(id);
    if (!outlet) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    
    const sales = await storage.getSalesWithCalculations({ outletId: id });
    
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    const outlet = await storage.getOutlet(id);
    if (!outlet) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    
    const deletedCount = await storage.deleteSalesByOutlet(id);
    
    return NextResponse.json({ 
      message: `${deletedCount} data penjualan berhasil dihapus`,
      deletedCount 
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
