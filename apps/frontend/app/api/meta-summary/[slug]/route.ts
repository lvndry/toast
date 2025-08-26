import { NextRequest, NextResponse } from "next/server"

import { httpJson } from "@lib/http"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  try {
    const metaSummary = await httpJson(
      `${BACKEND_BASE_URL}/companies/${slug}/meta-summary`,
      { method: "GET" },
    )
    return NextResponse.json(metaSummary)
  } catch (error) {
    console.error("Error fetching meta summary:", error)
    return NextResponse.json(
      { error: `Failed to fetch meta summary: ${error}` },
      { status: 500 },
    )
  }
}
