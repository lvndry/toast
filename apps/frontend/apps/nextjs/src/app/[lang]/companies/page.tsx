"use client";

import { HoverEffect } from "@saasfly/ui/card-hover-effect";
import { useEffect, useState } from "react";
import { env } from "~/env.mjs";

interface Company {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

async function fetchCompanies(): Promise<Company[]> {
  console.log("env.NEXT_PUBLIC_BACKEND_URL", env.NEXT_PUBLIC_BACKEND_URL);
  const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/toast/companies`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return (await res.json()) as Company[];
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch(() => setError("Failed to fetch companies"));
  }, []);

  const items = companies.map((company) => ({
    title: company.name,
    description: company.description ?? "",
    link: company.website ?? "#",
    logo: company.logo_url,
  }));

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Supported Companies</h1>
      {error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : items.length > 0 ? (
        <HoverEffect items={items} />
      ) : (
        <div className="text-center text-neutral-500">No companies found.</div>
      )}
    </div>
  );
}
