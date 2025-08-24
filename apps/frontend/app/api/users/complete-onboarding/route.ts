import { httpJson } from "@lib/http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function POST(_request: NextRequest) {
  try {
    const result = await httpJson(`${BACKEND_BASE_URL}/users/complete-onboarding`, {
      method: "POST",
      body: { completed: true },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: `Failed to complete onboarding: ${error}` },
      { status: 500 }
    );
  }
}
