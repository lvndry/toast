import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
    }

    // For now, we'll return a placeholder logo URL
    // In the future, this could call a logo service or use a default logo
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    return NextResponse.json({ logo: logoUrl });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: `Failed to fetch logo: ${error}` },
      { status: 500 }
    );
  }
}
