import { NextRequest, NextResponse } from "next/server"

import { httpJson } from "@lib/http"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const companies = await httpJson(`${BACKEND_BASE_URL}/companies`, {
      method: "GET",
    })

    // Return the companies with caching headers
    return NextResponse.json(companies, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { error: `Failed to fetch companies: ${error}` },
      { status: 500 },
    )
  }
}
