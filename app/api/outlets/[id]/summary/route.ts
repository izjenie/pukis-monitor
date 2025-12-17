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
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    
    const outlet = await storage.getOutlet(id);
    if (!outlet) {
      return NextResponse.json({ message: "Outlet tidak ditemukan" }, { status: 404 });
    }
    
    const summary = await storage.getOutletMTDSummary(id, date);
    
    return NextResponse.json({
      outletId: id,
      outletName: outlet.name,
      cogsPerPiece: outlet.cogsPerPiece,
      ...summary,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
