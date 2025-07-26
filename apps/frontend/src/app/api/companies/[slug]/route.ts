import { getBackendUrl } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; }
) {
  try {
    const { slug } = await params;
    const backendUrl = getBackendUrl('companies/slug');
    const response = await fetch(`${backendUrl}/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const company = await response.json();

    // Return the company with caching headers
    return NextResponse.json(company, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: `Failed to fetch company: ${error}` },
      { status: 500 }
    );
  }
}
