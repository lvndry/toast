import { NextRequest, NextResponse } from "next/server"

import { httpJson } from "@lib/http"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await httpJson(`${BACKEND_BASE_URL}/q`, {
      method: "POST",
      body,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending query:", error)
    return NextResponse.json(
      { error: `Failed to send query: ${error}` },
      { status: 500 },
    )
  }
}
