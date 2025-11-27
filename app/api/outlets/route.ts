import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/db/storage";
import { insertOutletSchema } from "@shared/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const outlets = await storage.getOutlets();
    return NextResponse.json(outlets);
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
    const validatedData = insertOutletSchema.parse(body);
    const outlet = await storage.createOutlet(validatedData);
    return NextResponse.json(outlet, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
