import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    if (!date) {
      return NextResponse.json({ message: "Parameter date diperlukan" }, { status: 400 });
    }
    
    const summary = await storage.getMTDSummary(date);
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
