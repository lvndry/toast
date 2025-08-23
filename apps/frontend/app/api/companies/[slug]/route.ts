import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; }
) {
  const { slug } = await params;
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/companies/slug/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
    }

    const company = await response.json();
    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: `Failed to fetch company: ${error}` },
      { status: 500 }
    );
  }
}
