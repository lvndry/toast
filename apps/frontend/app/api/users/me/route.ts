import { httpJson } from "@lib/http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(_request: NextRequest) {
  try {
    const me = await httpJson(`${BACKEND_BASE_URL}/users/me`, { method: "GET" });
    return NextResponse.json(me);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: `Failed to fetch current user: ${error}` },
      { status: 500 }
    );
  }
}
