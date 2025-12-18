import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    const headers: HeadersInit = {};
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(`${FASTAPI_URL}/api/sales/${id}`, { headers });
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(`${FASTAPI_URL}/api/sales/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Sales PATCH proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    const headers: HeadersInit = {};
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(`${FASTAPI_URL}/api/sales/${id}`, {
      method: "DELETE",
      headers,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Sales DELETE proxy error:", error);
    return NextResponse.json(
      { detail: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
