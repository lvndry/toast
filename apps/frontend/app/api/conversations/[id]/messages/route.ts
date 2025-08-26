import { NextRequest, NextResponse } from "next/server"

import { httpJson } from "@lib/http"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await request.json()

    const result = await httpJson(
      `${BACKEND_BASE_URL}/conversations/${id}/messages`,
      {
        method: "POST",
        body: {
          conversation_id: id,
          message: body.message as string,
        },
      },
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: `Failed to send message: ${error}` },
      { status: 500 },
    )
  }
}
