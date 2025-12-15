import { NextRequest, NextResponse } from "next/server";

import { apiEndpoints } from "@lib/config";
import { httpJson } from "@lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const deepAnalysis = await httpJson(
      `${apiEndpoints.companies()}/${slug}/deep-analysis`,
      { method: "GET" },
    );
    return NextResponse.json(deepAnalysis);
  } catch (error) {
    console.error("Error fetching company deep analysis:", error);
    return NextResponse.json(
      { error: `Failed to fetch company deep analysis: ${error}` },
      { status: 500 },
    );
  }
}
