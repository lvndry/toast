import { NextRequest, NextResponse } from "next/server";

import { apiEndpoints } from "@lib/config";
import { httpJson } from "@lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; }>; },
) {
  const { slug } = await params;
  try {
    const company = await httpJson(
      `${apiEndpoints.companies()}/${slug}`,
      { method: "GET" },
    );
    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: `Failed to fetch company: ${error}` },
      { status: 500 },
    );
  }
}
