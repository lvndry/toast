"use client";

import {
  Button,
  Card,
  Heading,
  Icon,
  Input,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  documentsCount?: number;
  logo?: string;
}

// Gradient backgrounds for cards
const gradientBackgrounds = [
  "from-blue-500/10 to-purple-500/10",
  "from-emerald-500/10 to-teal-500/10",
  "from-orange-500/10 to-red-500/10",
  "from-pink-500/10 to-rose-500/10",
  "from-indigo-500/10 to-blue-500/10",
  "from-green-500/10 to-emerald-500/10",
  "from-yellow-500/10 to-orange-500/10",
  "from-purple-500/10 to-pink-500/10",
  "from-cyan-500/10 to-blue-500/10"
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoLoadingStates, setLogoLoadingStates] = useState<Record<string, boolean>>({});

  const MotionCard = motion(Card);

  async function fetchCompanyLogo(company: Company): Promise<string | null> {
    try {
      // Set loading state for this company's logo
      setLogoLoadingStates(prev => ({ ...prev, [company.id]: true }));

      const params = new URLSearchParams();
      if (company.website) {
        // Extract domain from website URL
        const domain = company.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        params.append('domain', domain);
      } else {
        // Use company slug as domain fallback
        params.append('domain', company.slug);
      }

      const response = await fetch(`/api/companies/logos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        return data.logo || null;
      }
    } catch (error) {
      console.warn(`Failed to fetch logo for ${company.name}:`, error);
    } finally {
      // Clear loading state for this company's logo
      setLogoLoadingStates(prev => ({ ...prev, [company.id]: false }));
    }
    return null;
  }

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const response = await fetch('/api/companies');

        if (!response.ok) {
          throw new Error(`Failed to fetch companies: ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Fetch logos for each company
        const companiesWithLogos = await Promise.all(
          data.map(async (company: Company) => {
            const logo = await fetchCompanyLogo(company);
            return { ...company, logo };
          })
        );

        setCompanies(companiesWithLogos);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="max-w-7xl px-8 py-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-6 justify-center items-center text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Icon name="loading" size="xl" onBackground="brand-strong" />
              </motion.div>
              <Heading variant="heading-strong-l" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loading Companies...
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Fetching our database of analyzed companies
              </Text>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex justify-center items-center">
        <div className="max-w-7xl px-8 py-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col gap-6 justify-center items-center text-center">
              <Icon name="alert" size="xl" onBackground="brand-strong" />
              <Heading variant="heading-strong-l">Error Loading Companies</Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {error}
              </Text>
              <Button
                size="m"
                weight="strong"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col justify-center gap-6 items-center text-center">
            <Heading variant="display-strong-xl" className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Search Companies
            </Heading>
            <Text
              variant="heading-default-l"
              onBackground="neutral-weak"
              wrap="balance"
              className="max-w-2xl text-center"
            >
              Browse thousands of companies and analyze their legal documents with AI
            </Text>
          </div>
        </motion.div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto flex justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center w-3xl">
            <Icon
              name="search"
              size="l"
              onBackground="neutral-weak"
              className="ml-4"
            />
            <Input
              id="search-companies"
              type="text"
              placeholder="Search companies by name, description, or industry..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="flex-1 py-5 px-4 border-none text-lg outline-none bg-transparent font-medium w-full"
            />
            {searchTerm && (
              <Button
                size="s"
                variant="secondary"
                onClick={() => setSearchTerm("")}
                className="mr-2"
              >
                Clear
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Companies Grid */}
      <div className="py-6 flex justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <Text variant="heading-strong-m" className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                {filteredCompanies.length} Companies Found
              </Text>
            </div>

            {filteredCompanies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex flex-col gap-4 justify-center items-center p-8 text-center">
                  <Icon name="search" size="xl" onBackground="neutral-weak" />
                  <Heading variant="heading-strong-m">No companies found</Heading>
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    Try adjusting your search terms
                  </Text>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {filteredCompanies.sort((a, b) => a.name.localeCompare(b.name)).map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    className="relative"
                  >
                    <MotionCard
                      paddingX="xl"
                      paddingY="xl"
                      radius="xl"
                      vertical="center"
                      horizontal="center"
                      className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative w-80 h-72 flex flex-col justify-between overflow-hidden hover:bg-white/90"
                      onClick={() => window.location.href = `/companies/${company.slug}`}
                      whileHover={{
                        y: -8,
                        scale: 1.01,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{
                        scale: 0.99,
                        transition: { duration: 0.1 }
                      }}
                    >
                      {/* Subtle gradient overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />

                      <div className="flex flex-col gap-4 justify-center items-center h-full z-10 text-center w-full min-w-0">
                        {/* Company Logo */}
                        <div className="relative w-16 h-16 mb-2 group/logo">
                          {logoLoadingStates[company.id] ? (
                            // Loading state
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center animate-pulse shadow-sm">
                              <Icon name="loading" size="m" onBackground="neutral-weak" />
                            </div>
                          ) : company.logo ? (
                            <div className="relative">
                              <Image
                                src={company.logo}
                                alt={`${company.name} logo`}
                                width={64}
                                height={64}
                                className="rounded-xl object-contain bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm group-hover/logo:shadow-lg group-hover/logo:scale-105 transition-all duration-300"
                                onError={() => {
                                  // Handle error by showing fallback
                                  const logoContainer = document.querySelector(`[data-company-id="${company.id}"]`);
                                  if (logoContainer) {
                                    const img = logoContainer.querySelector('img');
                                    const fallback = logoContainer.querySelector('.logo-fallback');
                                    if (img && fallback) {
                                      img.style.display = 'none';
                                      fallback.classList.remove('hidden');
                                      fallback.classList.add('flex');
                                    }
                                  }
                                }}
                              />
                              {/* Subtle overlay on hover */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-white/10 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
                            </div>
                          ) : null}
                          {/* Fallback icon when no logo or logo fails to load */}
                          <div
                            data-company-id={company.id}
                            className={`logo-fallback w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover/logo:shadow-lg group-hover/logo:scale-105 transition-all duration-300 ${company.logo && !logoLoadingStates[company.id] ? 'hidden' : 'flex'}`}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <Heading
                          variant="heading-strong-m"
                          className="text-slate-800 group-hover:text-blue-600 transition-colors duration-300 font-bold truncate w-full text-[clamp(1rem,2vw,1.5rem)]"
                          title={company.name}
                        >
                          {company.name}
                        </Heading>
                        {company.description && (
                          <Text
                            variant="body-default-m"
                            onBackground="neutral-weak"
                            className="leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors duration-300 line-clamp-3"
                          >
                            {company.description}
                          </Text>
                        )}
                      </div>
                    </MotionCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
