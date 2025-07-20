"use client";

import {
  Badge,
  Button,
  Card,
  Column,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
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
          throw new Error(`Failed to fetch companies: ${response.status}`);
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
      <Column fillWidth className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" horizontal="center" align="center">
        <Column maxWidth="xl" padding="xl" horizontal="center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Column gap="l" horizontal="center" align="center">
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
            </Column>
          </motion.div>
        </Column>
      </Column>
    );
  }

  if (error) {
    return (
      <Column fillWidth className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50" horizontal="center" align="center">
        <Column maxWidth="xl" padding="xl" horizontal="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Column gap="l" horizontal="center" align="center">
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
            </Column>
          </motion.div>
        </Column>
      </Column>
    );
  }

  return (
    <Column fillWidth className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Header Section */}
      <Column maxWidth="xl" padding="l" horizontal="center" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Column horizontal="center" gap="l" align="center">
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
          </Column>
        </motion.div>
      </Column>

      {/* Search Section */}
      <Column maxWidth="xl" horizontal="center" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Row
            vertical="center"
            horizontal="center"
            align="center"
            width="m"
          >
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
          </Row>
        </motion.div>
      </Column>

      {/* Companies Grid */}
      <Column paddingY="l" horizontal="center" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Column gap="l">
            <Row horizontal="space-between" align="center">
              <Text variant="heading-strong-m" className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                {filteredCompanies.length} Companies Found
              </Text>
            </Row>

            {filteredCompanies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Column gap="m" horizontal="center" align="center" padding="xl">
                  <Icon name="search" size="xl" onBackground="neutral-weak" />
                  <Heading variant="heading-strong-m">No companies found</Heading>
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    Try adjusting your search terms
                  </Text>
                </Column>
              </motion.div>
            ) : (
              <Grid
                columns={3}
                gap="l"
              >
                {filteredCompanies.map((company, index) => (
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
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                  >
                    <Card
                      paddingX="xl"
                      paddingY="l"
                      radius="l"
                      vertical="center"
                      className={`bg-gradient-to-br ${gradientBackgrounds[index % gradientBackgrounds.length]} backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group h-72 w-full relative`}
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

                      <Column gap="m" vertical="center" className="h-full relative z-10">
                        <Row horizontal="space-between" align="center" vertical="center" className="flex-shrink-0">
                          <Heading variant="heading-strong-m" className="text-slate-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 font-bold">
                            {company.name}
                          </Heading>
                          <Row gap="s" align="center" className="flex-shrink-0">
                            {company.website && (
                              <Button
                                size="s"
                                variant="secondary"
                                prefixIcon="external-link"
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                              />
                            )}
                            <motion.div
                              initial={false}
                              animate={{ x: 0 }}
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Icon
                                name="arrowRight"
                                size="s"
                                onBackground="neutral-weak"
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                              />
                            </motion.div>
                          </Row>
                        </Row>

                        <div className="flex-1 min-h-0">
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

                        <Row gap="m" wrap className="flex-shrink-0">
                          {company.industry && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge
                                textVariant="label-default-s"
                                onBackground="neutral-medium"
                                border="neutral-alpha-medium"
                                className="bg-white/60 backdrop-blur-sm text-slate-700 border border-white/40 group-hover:bg-white/80 transition-all duration-300 font-medium"
                              >
                                {company.industry}
                              </Badge>
                            </motion.div>
                          )}
                          {company.documentsCount && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge
                                textVariant="label-default-s"
                                onBackground="brand-medium"
                                border="brand-alpha-medium"
                                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-blue-700 border border-blue-200/50 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 font-medium"
                              >
                                {company.documentsCount} documents
                              </Badge>
                            </motion.div>
                          )}
                        </Row>
                      </Column>
                    </Card>
                  </motion.div>
                ))}
              </Grid>
            )}
          </Column>
        </motion.div>
      </Column>
    </Column>
  );
}
