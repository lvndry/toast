import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/companies`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status} ${response.statusText}`);
    }

    const companies = await response.json();

    // Return the companies with caching headers
    return NextResponse.json(companies, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: `Failed to fetch companies: ${error}` },
      { status: 500 }
    );
  }
}
