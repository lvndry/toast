import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;

  try {
    if (!domain) {
      return NextResponse.json(
        { error: "domain parameter is required" },
        { status: 400 },
      );
    }

    const logoDevToken = process.env.LOGO_DEV_PUBLIC_KEY;
    const logoSources: string[] = [];

    // Add Logo.dev if token is available
    if (logoDevToken) {
      logoSources.push(`https://img.logo.dev/${domain}?token=${logoDevToken}`);
    }

    if (logoSources.length === 0) {
      return NextResponse.json(
        {
          error:
            "Logo.dev Public Key not configured. Set LOGO_DEV_PUBLIC_KEY environment variable.",
        },
        { status: 500 },
      );
    }

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const logoUrl of logoSources) {
      try {
        response = await fetch(logoUrl, {
          headers: {
            Accept: "image/*",
          },
        });

        if (response.ok) {
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch logo: ${response?.statusText || lastError?.message || "Unknown error"}`,
        },
        { status: response?.status || 500 },
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
    console.error("Error proxying logo:", error);
    return NextResponse.json(
      { error: `Failed to proxy logo: ${error}` },
      { status: 500 },
    );
  }
}
