import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/companies/meta-summary/${params.slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
    }

    const metaSummary = await response.json();
    return NextResponse.json(metaSummary);
  } catch (error) {
    console.error("Error fetching meta summary:", error);
    return NextResponse.json(
      { error: `Failed to fetch meta summary: ${error}` },
      { status: 500 }
    );
  }
} 