import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { insertSalesSchema } from "@shared/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const outletId = searchParams.get("outletId") || undefined;
    
    const sales = await storage.getSalesWithCalculations({ date, outletId });
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = insertSalesSchema.parse(body);
    
    if (validatedData.totalProduction < validatedData.totalSold) {
      return NextResponse.json(
        { message: "Total produksi harus >= total terjual" },
        { status: 400 }
      );
    }
    
    const outlet = await storage.getOutlet(validatedData.outletId);
    if (!outlet) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    
    const existingSales = await storage.getSales({
      date: validatedData.date,
      outletId: validatedData.outletId,
    });
    
    if (existingSales.length > 0) {
      return NextResponse.json(
        { message: "Data penjualan untuk tanggal dan outlet ini sudah ada. Silakan edit data yang sudah ada." },
        { status: 400 }
      );
    }
    
    const sale = await storage.createSales(validatedData);
    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
