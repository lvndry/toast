import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_BASE_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/toast/users/tier-limits`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching tier limits:", error)
    return NextResponse.json(
      { error: "Failed to fetch tier limits" },
      { status: 500 },
    )
  }
}
