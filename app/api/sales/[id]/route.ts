import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { updateSalesSchema } from "@shared/schema";
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
    const sale = await storage.getSalesById(id);
    if (!sale) {
      return NextResponse.json({ message: "Data penjualan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(sale);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSalesSchema.parse(body);
    const sale = await storage.updateSales(id, validatedData);
    if (!sale) {
      return NextResponse.json({ message: "Data penjualan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(sale);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
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
    const deleted = await storage.deleteSales(id);
    if (!deleted) {
      return NextResponse.json({ message: "Data penjualan tidak ditemukan" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
