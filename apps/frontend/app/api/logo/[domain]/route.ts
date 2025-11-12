import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } },
) {
  try {
    const { domain } = params;

    if (!domain) {
      return NextResponse.json(
        { error: "domain parameter is required" },
        { status: 400 },
      );
    }

    // Fetch the logo from Clearbit server-side
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const response = await fetch(clearbitUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch logo: ${response.statusText}` },
        { status: response.status },
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error proxying Clearbit logo:", error);
    return NextResponse.json(
      { error: `Failed to proxy logo: ${error}` },
      { status: 500 },
    );
  }
}
