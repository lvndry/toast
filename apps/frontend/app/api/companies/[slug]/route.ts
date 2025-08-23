import { httpJson } from "@lib/http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; }
) {
  const { slug } = await params;
  try {
    const company = await httpJson(`${BACKEND_BASE_URL}/companies/slug/${slug}`, { method: "GET" });
    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: `Failed to fetch company: ${error}` },
      { status: 500 }
    );
  }
}
