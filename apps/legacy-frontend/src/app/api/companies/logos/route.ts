import { NextRequest, NextResponse } from "next/server";

interface LogoResponse {
  logo?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get("name");
    const domain = searchParams.get("domain");

    if (!companyName && !domain) {
      return NextResponse.json(
        { error: "Either company name or domain is required" },
        { status: 400 }
      );
    }

    // Try multiple logo services with fallbacks
    const logoServices: string[] = [
      // Primary: Google's favicon service (more reliable)
      ...(domain ? [`https://www.google.com/s2/favicons?domain=${domain}&sz=64`] : []),
      // Secondary: DuckDuckGo favicon service
      ...(domain ? [`https://icons.duckduckgo.com/ip3/${domain}.ico`] : []),
      // Tertiary: Clearbit (if available)
      ...(domain ? [`https://logo.clearbit.com/${domain}`] : []),
      // Try with .com extension for slug-based domains
      ...(domain && !domain.includes('.') ? [`https://logo.clearbit.com/${domain}.com`] : []),
      // Fallback: UI Avatars with company name
      `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || domain || '')}&background=random&color=fff&size=128&rounded=true&bold=true`,
      // Final fallback: DiceBear initials
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName || domain || '')}&backgroundColor=6366f1,8b5cf6&textColor=ffffff`
    ];

    // Try each logo service until one works
    for (const logoUrl of logoServices) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout

        const response = await fetch(logoUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LogoBot/1.0)",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // Check if the response is actually an image
          const contentType = response.headers.get("content-type");
          if (contentType && (contentType.startsWith("image/") || contentType.includes("svg"))) {
            return NextResponse.json({ logo: logoUrl });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch logo from ${logoUrl}:`, error);
        continue; // Try next service
      }
    }

    // If all else fails, return a default logo
    return NextResponse.json({
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || domain || 'Company')}&background=6366f1&color=fff&size=128&rounded=true&bold=true`
    });

  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: "Failed to fetch logo" },
      { status: 500 }
    );
  }
}
