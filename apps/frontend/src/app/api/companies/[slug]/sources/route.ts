import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; }
) {
  try {
    const { slug } = await params;

    // Forward the request to the backend
    const backendUrl = env.BACKEND_BASE_URL;
    const response = await fetch(`${backendUrl}/companies/${slug}/sources`);

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: `Failed to fetch sources: ${error}` },
      { status: 500 }
    );
  }
}
