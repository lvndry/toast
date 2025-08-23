import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  const { id } = await params;
  try {
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_BASE_URL}/conversations/${id}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
    }

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
