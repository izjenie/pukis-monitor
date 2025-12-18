import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const headers: HeadersInit = {};
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${FASTAPI_URL}/api/sales/mtd?${queryString}`
      : `${FASTAPI_URL}/api/sales/mtd`;
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Sales MTD proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
