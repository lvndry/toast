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

    if (!company.logo && company.domains) {
      const domain = company.domains[0];

      const logoDevToken = process.env.LOGO_DEV_PUBLIC_KEY;

      if (logoDevToken) {
        return NextResponse.json({
          logo: `https://img.logo.dev/${domain}?token=${logoDevToken}`,
        });
      }
    }

    return NextResponse.json({ logo: company.logo });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: `Failed to fetch logo: ${error}` },
      { status: 500 },
    );
  }
}
