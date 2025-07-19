"use client";

import {
  Badge,
  Button,
  Card,
  Column,
  Heading,
  Icon,
  Row,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
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
      <Column fillWidth style={{ minHeight: "100vh" }} horizontal="center" align="center">
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
      <Column fillWidth style={{ minHeight: "100vh" }} horizontal="center" align="center">
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
    <Column fillWidth style={{ minHeight: "100vh" }}>
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
              style={{ maxWidth: "600px" }}
            >
              Browse thousands of companies and analyze their legal documents with AI
            </Text>
          </Column>
        </motion.div>
      </Column>

      {/* Search Section */}
      <Column maxWidth="xl" padding="l" horizontal="center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Row gap="m" align="center" style={{ maxWidth: "500px", width: "100%" }}>
            <Icon name="search" size="m" onBackground="neutral-weak" />
            <input
              type="text"
              placeholder="Search companies by name, description, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                backgroundColor: "white"
              }}
            />
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
              {searchTerm && (
                <Button
                  size="s"
                  variant="secondary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
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
              <Row gap="l" wrap horizontal="center">
                {filteredCompanies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    style={{ flex: "1", minWidth: "300px", maxWidth: "400px" }}
                  >
                    <Card padding="l" style={{ height: "100%" }}>
                      <Column gap="m">
                        <Row horizontal="space-between" align="center">
                          <Heading variant="heading-strong-m">{company.name}</Heading>
                          {company.website && (
                            <Button
                              size="s"
                              variant="primary"
                              prefixIcon="external-link"
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          )}
                        </Row>

                        {company.description && (
                          <Text variant="body-default-m" onBackground="neutral-weak">
                            {company.description}
                          </Text>
                        )}

                        <Row gap="m" wrap>
                          {company.industry && (
                            <Badge
                              textVariant="label-default-s"
                              onBackground="neutral-medium"
                              border="neutral-alpha-medium"
                            >
                              {company.industry}
                            </Badge>
                          )}
                          {company.documentsCount && (
                            <Badge
                              textVariant="label-default-s"
                              onBackground="brand-medium"
                              border="brand-alpha-medium"
                            >
                              {company.documentsCount} documents
                            </Badge>
                          )}
                        </Row>

                        <Button
                          size="m"
                          weight="strong"
                          prefixIcon="search"
                          href={`/companies/${company.id}`}
                          style={{ marginTop: "auto" }}
                        >
                          Analyze Documents
                        </Button>
                      </Column>
                    </Card>
                  </motion.div>
                ))}
              </Row>
            )}
          </Column>
        </motion.div>
      </Column>
    </Column>
  );
}
