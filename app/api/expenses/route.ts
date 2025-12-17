import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { insertExpenseSchema } from "@shared/schema";
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
    const type = searchParams.get("type") as "harian" | "bulanan" | undefined;
    
    const expenses = await storage.getExpensesWithOutlet({ date, outletId, type });
    return NextResponse.json(expenses);
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
    const validatedData = insertExpenseSchema.parse(body);
    
    const outlet = await storage.getOutlet(validatedData.outletId);
    if (!outlet) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    
    const expense = await storage.createExpense(validatedData);
    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
