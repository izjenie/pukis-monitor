import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { updateExpenseSchema } from "@shared/schema";
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
    const expense = await storage.getExpenseById(id);
    if (!expense) {
      return NextResponse.json({ message: "Data pengeluaran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(expense);
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
    const validatedData = updateExpenseSchema.parse(body);
    const expense = await storage.updateExpense(id, validatedData);
    if (!expense) {
      return NextResponse.json({ message: "Data pengeluaran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(expense);
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
    const deleted = await storage.deleteExpense(id);
    if (!deleted) {
      return NextResponse.json({ message: "Data pengeluaran tidak ditemukan" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
