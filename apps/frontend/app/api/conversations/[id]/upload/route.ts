import { http } from "@lib/http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  const { id } = await params;
  try {
    const formData = await request.formData();

    const response = await http(`${BACKEND_BASE_URL}/conversations/${id}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: `Failed to upload document: ${error}` },
      { status: 500 }
    );
  }
}
