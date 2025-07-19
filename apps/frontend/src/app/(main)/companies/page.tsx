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
      <Column fillWidth className="min-h-screen" horizontal="center" align="center">
        <Column maxWidth="xl" padding="xl" horizontal="center">
          <Column gap="l" horizontal="center" align="center">
            <Icon name="loading" size="xl" onBackground="brand-strong" />
            <Heading variant="heading-strong-l">Loading Companies...</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Fetching our database of analyzed companies
            </Text>
          </Column>
        </Column>
      </Column>
    );
  }

  if (error) {
    return (
      <Column fillWidth className="min-h-screen" horizontal="center" align="center">
        <Column maxWidth="xl" padding="xl" horizontal="center">
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
        </Column>
      </Column>
    );
  }

  return (
    <Column fillWidth className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Header Section */}
      <Column maxWidth="xl" padding="l" horizontal="center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Column horizontal="center" gap="l" align="center">
            <Heading variant="display-strong-xl">
              Search Companies
            </Heading>
            <Text
              variant="heading-default-l"
              onBackground="neutral-weak"
              wrap="balance"
              className="max-w-2xl"
            >
              Browse thousands of companies and analyze their legal documents with AI
            </Text>
          </Column>
        </motion.div>
      </Column>

      {/* Search Section */}
      <Column maxWidth="xl" horizontal="center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <Row
            vertical="center"
            className="max-w-4xl w-full bg-white rounded-2xl p-2 shadow-lg border border-gray-100"
          >
            <Icon name="search" size="l" onBackground="neutral-weak" className="ml-4" />
            <Input
              id="search-companies"
              type="text"
              placeholder="Search companies by name, description, or industry..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="flex-1 py-5 px-4 border-none text-lg outline-none bg-transparent font-medium"
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
      <Column maxWidth="xl" padding="l" horizontal="center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Column gap="l">
            <Row horizontal="space-between" align="center">
              <Text variant="heading-strong-m">
                {filteredCompanies.length} Companies Found
              </Text>
            </Row>

            {filteredCompanies.length === 0 ? (
              <Column gap="m" horizontal="center" align="center" padding="xl">
                <Icon name="search" size="xl" onBackground="neutral-weak" />
                <Heading variant="heading-strong-m">No companies found</Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  Try adjusting your search terms
                </Text>
              </Column>
            ) : (
              <Grid
                columns={3}
                gap="l"
              >
                {filteredCompanies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card
                      padding="l"
                      radius="l"
                      className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group h-64 w-full"
                      onClick={() => window.location.href = `/companies/${company.slug}`}
                    >
                      <Column gap="m" className="h-full">
                        <Row horizontal="space-between" align="center" className="flex-shrink-0">
                          <Heading variant="heading-strong-m" className="text-slate-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              />
                            )}
                            <Icon
                              name="arrow-right"
                              size="s"
                              onBackground="neutral-weak"
                              className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                            />
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
                            <Badge
                              textVariant="label-default-s"
                              onBackground="neutral-medium"
                              border="neutral-alpha-medium"
                              className="bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200 transition-colors duration-300"
                            >
                              {company.industry}
                            </Badge>
                          )}
                          {company.documentsCount && (
                            <Badge
                              textVariant="label-default-s"
                              onBackground="brand-medium"
                              border="brand-alpha-medium"
                              className="bg-blue-100 text-blue-700 border border-blue-200 group-hover:bg-blue-200 transition-colors duration-300"
                            >
                              {company.documentsCount} documents
                            </Badge>
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
