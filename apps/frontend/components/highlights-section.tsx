import {
  Avatar,
  Box,
  Flex,
  SimpleGrid,
  Text,
  VStack,
  Container
} from "@chakra-ui/react";

import { Highlight } from "@components/highlights";
import { FallInPlace } from "@components/motion/fall-in-place";

export function HighlightsSection() {
  return (
    <Box py={24}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          <FallInPlace delay={0.0}>
            <Highlight
              title="AI-Powered Legal Analysis"
              description={
                <VStack alignItems="flex-start" spacing="4">
                  <Text color="gray.600" fontSize="lg">
                    Get started with <Text as="span" fontWeight="bold">instant legal document analysis</Text>.
                    Our AI has already analyzed thousands of companies&apos; terms of service,
                    privacy policies, and legal agreements. Search and understand complex
                    legal documents in seconds, not hours.
                  </Text>
                </VStack>
              }
            />
          </FallInPlace>

          <FallInPlace delay={0.1}>
            <Highlight
              title="Pre-analyzed Database"
              description={
                <Text color="gray.600" fontSize="lg">
                  We&apos;ve done the heavy lifting - our AI has already scraped and analyzed legal documents
                  from thousands of websites. No more manual document reading or legal jargon confusion.
                </Text>
              }
            />
          </FallInPlace>

          <FallInPlace delay={0.2}>
            <Box
              p={6}
              bg="white"
              borderRadius="lg"
              shadow="md"
              bgGradient="linear(to-br, pink.200, purple.500)"
              color="white"
              transition="all 0.2s ease"
              _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
            >
              <VStack align="flex-start" spacing="4">
                <Flex align="center" gap={3}>
                  <Avatar size="sm" src="/static/images/avatar.jpg" />
                  <Box>
                    <Text fontWeight="semibold">Sarah Chen</Text>
                    <Text fontSize="sm" opacity={0.8}>General Counsel</Text>
                  </Box>
                </Flex>
                <Text fontSize="lg" fontStyle="italic">
                  &quot;ToastAI saved our team hours of work. What used to take days now takes minutes.
                  Finally, a tool that makes legal documents actually readable.&quot;
                </Text>
              </VStack>
            </Box>
          </FallInPlace>

          <FallInPlace delay={0.3}>
            <Highlight
              title="Start analyzing legal documents in three simple steps"
              description={
                <Text color="gray.600" fontSize="lg">
                  We&apos;ve made legal document analysis accessible to everyone through AI-powered insights.
                </Text>
              }
            />
          </FallInPlace>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
