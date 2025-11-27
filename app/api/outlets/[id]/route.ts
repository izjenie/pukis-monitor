import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { insertOutletSchema } from "@shared/schema";
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
    return NextResponse.json(outlet);
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
    const validatedData = insertOutletSchema.parse(body);
    const outlet = await storage.updateOutlet(id, validatedData);
    if (!outlet) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(outlet);
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
    const deleted = await storage.deleteOutlet(id);
    if (!deleted) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
