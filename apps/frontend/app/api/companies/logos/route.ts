import { apiEndpoints } from "@lib/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const domain = searchParams.get("domain");

    if (!companyId && !domain) {
      return NextResponse.json(
        { error: "Either companyId or domain parameter is required" },
        { status: 400 },
      );
    }

    // If we have a company ID, fetch the company from backend
    if (companyId) {
      const response = await fetch(
        `${apiEndpoints.companies()}/${companyId}`,
      );
      if (response.ok) {
        const company = await response.json();
        if (company.logo) {
          return NextResponse.json({ logo: company.logo });
        }
      }
    }

    // Fallback to domain-based logo if no company logo found
    if (domain) {
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      return NextResponse.json({ logo: logoUrl });
    }

    return NextResponse.json({ logo: null });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: `Failed to fetch logo: ${error}` },
      { status: 500 },
    );
  }
}
