import {
  Badge,
  Button,
  Card,
  Column,
  Heading,
  Row
} from "@once-ui-system/core";
import { motion } from "motion/react";

interface CompanyMetaSummary {
  id: string;
  name: string;
  summary: string;
  industry?: string;
  website?: string;
}

interface CompanyHeaderProps {
  companyMeta: CompanyMetaSummary | null;
  loading?: boolean;
}

export function CompanyHeader({ companyMeta, loading = false }: CompanyHeaderProps) {
  console.log("companyMeta", companyMeta);
  console.log("loading", loading);
  if (!loading) return null;

  return (
    <Column maxWidth="xl" padding="l" horizontal="center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <Card padding="l" radius="l" className="bg-white border border-gray-100 shadow-sm">
          <Column gap="l" vertical="space-between" horizontal="center" align="center" className="flex flex-col">
            <Row>
              <Heading variant="heading-strong-l">
                {companyMeta?.name || "Loading..."}
              </Heading>
              <Row gap="m" wrap>
                {companyMeta?.industry && (
                  <Badge
                    textVariant="label-default-s"
                    onBackground="neutral-medium"
                    border="neutral-alpha-medium"
                    className="bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {companyMeta.industry}
                  </Badge>
                )}
                {companyMeta?.website && (
                  <Button
                    size="s"
                    variant="secondary"
                    prefixIcon="external-link"
                    href={companyMeta.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </Button>
                )}
              </Row>
            </Row>
            <Row>
              <Button
                size="s"
                variant="secondary"
                prefixIcon="arrowLeft"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
            </Row>
          </Column>
        </Card>
      </motion.div>
    </Column>
  );
}
