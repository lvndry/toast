import { Box, Container, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { ButtonLink } from "@components/button-link/button-link";
import { Pricing } from "@components/pricing/pricing";
import pricing from "@data/pricing";

export function PricingSection({ onGetStartedClick }: { onGetStartedClick: (planId: string) => void; }) {
  return (
    <Box py={24}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <VStack spacing={4}>
            <Heading size="2xl" textAlign="center">
              {pricing.title}
            </Heading>
            <Text color="gray.600" textAlign="center" fontSize="lg">
              {pricing.description}
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {pricing.plans.map((plan) => (
              <Box key={plan.id} position="relative">
                {plan.isRecommended ? (
                  <Box position="absolute" top="-3" left="50%" transform="translateX(-50%)" zIndex={1}>
                    <Text fontSize="xs" fontWeight="semibold" bg="purple.500" color="white" px={3} py={1} borderRadius="full">
                      Most popular
                    </Text>
                  </Box>
                ) : null}
                <Pricing
                  title={plan.title}
                  description={plan.description}
                  price={`${plan.price}${plan.pricePeriod ? ` ${plan.pricePeriod}` : ""}`}
                  features={plan.features.map(f => f.title)}
                  border="1px"
                  borderColor={plan.isRecommended ? "purple.500" : "gray.200"}
                  shadow={plan.isRecommended ? "xl" : "md"}
                  transition="all 0.2s ease"
                  _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                  action={
                    <ButtonLink
                      href={plan.action.href}
                      colorScheme={plan.isRecommended ? "purple" : "gray"}
                      onClick={() => onGetStartedClick(plan.id)}
                      width="full"
                    >
                      Get Started
                    </ButtonLink>
                  }
                />
              </Box>
            ))}
          </SimpleGrid>

          <Text p="8" textAlign="center" color="gray.500">
            Free tier includes 10 company searches per month. VAT may be applicable depending on your location.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
