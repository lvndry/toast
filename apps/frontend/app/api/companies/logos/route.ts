import { NextRequest, NextResponse } from "next/server";

import { apiEndpoints } from "@lib/config";
import { httpJson } from "@lib/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "slug parameter is required" },
        { status: 400 },
      );
    }

    const company = await httpJson<{
      logo?: string | null;
      domains?: string[];
    }>(`${apiEndpoints.companies()}/${slug}`, { method: "GET" });

    let logo = company.logo;

    if (!logo && company.domains) {
      const domain = company.domains[0];

      const logoDevToken = process.env.LOGO_DEV_PUBLIC_KEY;

      if (logoDevToken) {
        logo = `https://img.logo.dev/${domain}?token=${logoDevToken}`;
      }
    }

    // Cache logos for 24 hours since they don't change frequently
    return NextResponse.json(
      { logo },
      {
        headers: {
          "Cache-Control":
            "public, max-age=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: `Failed to fetch logo: ${error}` },
      { status: 500 },
    );
  }
}
