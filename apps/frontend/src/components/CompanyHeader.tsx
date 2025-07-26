import {
  Badge,
  Card,
  Column,
  Heading,
  Row,
  Text
} from "@once-ui-system/core";
import { MetaSummary } from "../lib/types";

interface CompanyHeaderProps {
  companyMeta: MetaSummary;
}

export function CompanyHeader({ companyMeta }: CompanyHeaderProps) {
  return (
    <Card>
      <Column gap="m">
        <Row className="justify-between items-center">
          <Heading variant="heading-strong-l">Privacy Analysis</Heading>
          <div className="flex gap-2">
            {Object.entries(companyMeta.scores).map(([key, score]) => (
              <Badge
                key={key}
                textVariant="label-default-s"
                onBackground="neutral-medium"
                border="neutral-alpha-medium"
              >
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {score.score}/10
              </Badge>
            ))}
          </div>
        </Row>

        <Text variant="body-default-l">
          {companyMeta.summary}
        </Text>

        <div>
          <Heading variant="heading-strong-m" className="mb-2">Key Points</Heading>
          <ul className="list-disc list-inside space-y-1">
            {companyMeta.keypoints.map((point, index) => (
              <li key={index} className="text-sm">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Column>
    </Card>
  );
}
