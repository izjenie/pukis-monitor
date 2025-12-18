import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }
    
    const response = await fetch(`${FASTAPI_URL}/api/auth/user`, {
      headers: {
        "Authorization": authHeader,
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("User proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
