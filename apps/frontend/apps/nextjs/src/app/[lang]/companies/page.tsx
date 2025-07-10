"use client";

import { HoverEffect } from "@saasfly/ui/card-hover-effect";
import { useEffect, useState } from "react";
import { env } from "~/env.mjs";
import type { Company } from "~/types/company";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch(() => setError("Failed to fetch companies"));
  }, []);

  const items = companies.map((company) => ({
    title: company.name,
    description: company.description ?? "",
    link: `/${company.slug}`,
    logo: company.logo_url,
  }));

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Supported Companies</h1>
      <div className="flex justify-center mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-100 dark:bg-neutral-800 dark:text-white"
        />
      </div>
      {error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredItems.length > 0 ? (
        <HoverEffect items={filteredItems} />
      ) : (
        <div className="text-center text-neutral-500">No companies found.</div>
      )}
    </div>
  );
}
