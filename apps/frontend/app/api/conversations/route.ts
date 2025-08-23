import { httpJson } from "@lib/http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const conversation = await httpJson(`${BACKEND_BASE_URL}/conversations`, {
      method: "POST",
      body,
    });
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: `Failed to create conversation: ${error}` },
      { status: 500 }
    );
  }
}
