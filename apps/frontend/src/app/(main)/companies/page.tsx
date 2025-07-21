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
import { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  documentsCount?: number;
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

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const response = await fetch('/api/companies');

        if (!response.ok) {
          throw new Error(`Failed to fetch companies: ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setCompanies(data);
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
          <div className="flex items-center justify-center w-96">
            <Icon
              name="search" size="l"
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
                    whileHover={{
                      y: -12,
                      scale: 1.02,
                      zIndex: 10,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    className="relative"
                  >
                    <Card
                      paddingX="xl"
                      paddingY="xl"
                      radius="l"
                      vertical="center"
                      horizontal="center"
                      className={`bg-gradient-to-br ${gradientBackgrounds[index % gradientBackgrounds.length]} backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group relative`}
                      onClick={() => window.location.href = `/companies/${company.slug}`}
                    >
                      {/* Animated background overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        initial={false}
                      />

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                        initial={false}
                      />

                      <div className="flex flex-col gap-4 justify-center items-center h-full z-10">
                        <Heading variant="heading-strong-m" className="text-slate-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 font-bold">
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
                    </Card>
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
