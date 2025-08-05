import { getBackendUrl } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; }
) {
  try {
    const { slug } = await params;
    const backendUrl = getBackendUrl('companies/meta-summary');
    const response = await fetch(`${backendUrl}/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    console.log(response);
    const metaSummary = await response.json();

    // Return the meta summary with caching headers
    return NextResponse.json(metaSummary, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching meta summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch meta summary" },
      { status: 500 }
    );
  }
}
