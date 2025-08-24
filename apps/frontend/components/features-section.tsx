import {
  Box,
  Container,
  Icon,
  SimpleGrid,
  Text,
  VStack
} from "@chakra-ui/react";

import { Highlight } from "@components/highlights";
import { FallInPlace } from "@components/motion/fall-in-place";
import {
  FiClock,
  FiFileText,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiZap
} from "react-icons/fi";

export function FeaturesSection() {
  return (
    <Box py={24} bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Container maxW="container.xl">
        <VStack spacing={12}>
          {/* Section Header */}
          <FallInPlace delay={0.0}>
            <VStack spacing={4} textAlign="center">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="blue.600"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Why Choose Toast AI
              </Text>
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                color="gray.900"
                _dark={{ color: "white" }}
              >
                Legal Documents Made Simple
              </Text>
            </VStack>
          </FallInPlace>

          {/* Value Propositions */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            <FallInPlace delay={0.1}>
              <Highlight
                icon={<Icon as={FiSearch} w={6} h={6} color="blue.500" />}
                title="Instant Analysis"
                description="Get legal insights in seconds, not hours. Our AI understands complex legal jargon so you don't have to."
              />
            </FallInPlace>

            <FallInPlace delay={0.2}>
              <Highlight
                icon={<Icon as={FiFileText} w={6} h={6} color="green.500" />}
                title="Pre-analyzed Database"
                description="Thousands of companies already analyzed. Search privacy policies and terms instantly."
              />
            </FallInPlace>

            <FallInPlace delay={0.3}>
              <Highlight
                icon={<Icon as={FiShield} w={6} h={6} color="purple.500" />}
                title="Privacy Protection"
                description="Understand what companies do with your data before you sign up. Make informed decisions."
              />
            </FallInPlace>

            <FallInPlace delay={0.4}>
              <Highlight
                icon={<Icon as={FiClock} w={6} h={6} color="orange.500" />}
                title="Save Hours"
                description="Skip manual document reading. Get the key points and risks highlighted automatically."
              />
            </FallInPlace>

            <FallInPlace delay={0.5}>
              <Highlight
                icon={<Icon as={FiZap} w={6} h={6} color="pink.500" />}
                title="Plain English"
                description="Complex legal terms explained simply. No law degree required to understand your rights."
              />
            </FallInPlace>

            <FallInPlace delay={0.6}>
              <Highlight
                icon={<Icon as={FiTrendingUp} w={6} h={6} color="teal.500" />}
                title="Stay Updated"
                description="Monitor policy changes and get alerts when companies update their terms."
              />
            </FallInPlace>
          </SimpleGrid>

          {/* Quick Stats */}
          <FallInPlace delay={0.7}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  10,000+
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Companies Analyzed
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  95%
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Accuracy Rate
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                  &lt; 10s
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Average Analysis Time
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                  24/7
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Always Available
                </Text>
              </VStack>
            </SimpleGrid>
          </FallInPlace>
        </VStack>
      </Container>
    </Box>
  );
}
