import { NextRequest, NextResponse } from "next/server";

import { apiEndpoints } from "@lib/config";
import { httpJson } from "@lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; },
) {
  const { slug } = await params;
  try {
    const metaSummary = await httpJson(
      `${apiEndpoints.companies()}/${slug}/meta-summary`,
      { method: "GET" },
    );
    return NextResponse.json(metaSummary);
  } catch (error) {
    console.error("Error fetching meta summary:", error);
    return NextResponse.json(
      { error: `Failed to fetch meta summary: ${error}` },
      { status: 500 },
    );
  }
}
