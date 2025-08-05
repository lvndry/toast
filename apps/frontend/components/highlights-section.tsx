import {
  Tag,
  Text,
  VStack,
  Wrap
} from "@chakra-ui/react";

import {
  Highlights,
  HighlightsItem,
  HighlightsTestimonialItem,
} from "@components/highlights";
import { Em } from "@components/typography";

export function HighlightsSection() {
  return (
    <Highlights>
      <HighlightsItem colSpan={[1, null, 2]} title="AI-Powered Legal Analysis">
        <VStack alignItems="flex-start" spacing="8">
          <Text color="muted" fontSize="xl">
            Get started with <Em>instant legal document analysis</Em>.
            Our AI has already analyzed thousands of companies&apos; terms of service,
            privacy policies, and legal agreements. Search and understand complex
            legal documents in seconds, not hours.
          </Text>
        </VStack>
      </HighlightsItem>
      <HighlightsItem title="Pre-analyzed Database">
        <Text color="muted" fontSize="lg">
          We&apos;ve done the heavy lifting - our AI has already scraped and analyzed legal documents
          from thousands of websites. No more manual document reading or legal jargon confusion.
        </Text>
      </HighlightsItem>
      <HighlightsTestimonialItem
        name="Sarah Chen"
        description="General Counsel"
        avatar="/static/images/avatar.jpg"
        gradient={["pink.200", "purple.500"]}
      >
        &quot;ToastAI saved our team hours of work. What used to take days now takes minutes.
        Finally, a tool that makes legal documents actually readable.&quot;
      </HighlightsTestimonialItem>
      <HighlightsItem
        colSpan={[1, null, 2]}
        title="Start analyzing legal documents in three simple steps"
      >
        <Text color="muted" fontSize="lg">
          We&apos;ve made legal document analysis accessible to everyone through AI-powered insights.
        </Text>
        <Wrap mt="8">
          {[
            "instant search",
            "pre-analyzed data",
            "ai assistant",
            "legal summaries",
            "terms of service",
            "privacy policies",
            "legal agreements",
            "document analysis",
            "company research",
            "legal insights",
            "compliance checking",
            "risk assessment",
            "legal jargon",
            "document comparison",
            "legal questions",
            "regulatory compliance",
            "contract analysis",
          ].map((value) => (
            <Tag
              key={value}
              variant="subtle"
              colorScheme="purple"
              rounded="full"
              px="3"
            >
              {value}
            </Tag>
          ))}
        </Wrap>
      </HighlightsItem>
    </Highlights>
  );
}
