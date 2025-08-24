import { httpJson } from "@lib/http";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  const { id } = await params;
  try {
    const conversation = await httpJson(`${BACKEND_BASE_URL}/conversations/${id}`, {
      method: "GET",
    });
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: `Failed to fetch conversation: ${error}` },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const result = await httpJson(`${BACKEND_BASE_URL}/conversations/${id}`, {
      method: "PATCH",
      body,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error patching conversation:", error);
    return NextResponse.json(
      { error: `Failed to patch conversation: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  const { id } = await params;
  try {
    const result = await httpJson(`${BACKEND_BASE_URL}/conversations/${id}`, {
      method: "DELETE",
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: `Failed to delete conversation: ${error}` },
      { status: 500 }
    );
  }
}
