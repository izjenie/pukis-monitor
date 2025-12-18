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
      ? `${FASTAPI_URL}/api/sales?${queryString}`
      : `${FASTAPI_URL}/api/sales`;
    
    const response = await fetch(url, { headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Sales GET proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(`${FASTAPI_URL}/api/sales`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Sales POST proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
