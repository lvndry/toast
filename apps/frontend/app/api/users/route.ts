import { NextRequest, NextResponse } from "next/server"

import { httpJson } from "@lib/http"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await httpJson(`${BACKEND_BASE_URL}/users`, {
      method: "POST",
      body,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: `Failed to create user: ${error}` },
      { status: 500 },
    )
  }
}
