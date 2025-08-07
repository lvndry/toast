import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_BASE_URL}/q`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending query:", error);
    return NextResponse.json(
      { error: `Failed to send query: ${error}` },
      { status: 500 }
    );
  }
} 