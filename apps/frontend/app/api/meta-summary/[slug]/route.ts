import { NextRequest, NextResponse } from "next/server";

import { apiEndpoints } from "@lib/config";
import { httpJson } from "@lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    // Use the overview endpoint which returns verdict and risk_score
    const overview = await httpJson(
      `${apiEndpoints.companies()}/${slug}/overview`,
      { method: "GET" },
    );
    return NextResponse.json(overview);
  } catch (error) {
    console.error("Error fetching meta summary:", error);
    return NextResponse.json(
      { error: `Failed to fetch meta summary: ${error}` },
      { status: 500 },
    );
  }
}
