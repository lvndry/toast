"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack
} from "@chakra-ui/react";

import { ButtonLink } from "@components/button-link/button-link";
import { Faq } from "@components/faq";
import { FeaturesSection } from "@components/features-section";
import HeroSection from "@components/hero-section";
import { Pricing } from "@components/pricing/pricing";
import { Testimonial, Testimonials } from "@components/testimonials";
import faq from "@data/faq";
import pricing from "@data/pricing";
import testimonials from "@data/testimonials";
import { useEffect, useMemo } from "react";

import { useAnalytics } from "../../hooks/useAnalytics";
import { useTierLimits } from "../../hooks/useTierLimits";

function Home() {
  const { trackPageView, trackUserJourney } = useAnalytics();

  // Track landing page view
  useEffect(() => {
    trackPageView("landing_page");
  }, [trackPageView]);

  const handleGetStartedClick = (planId: string) => {
    trackUserJourney.featureUsed("get_started_clicked", {
      plan_id: planId,
      location: "pricing_section",
    });
  };

  return (
    <Box>
      <HeroSection />

      <Box as="section" id="features">
        <FeaturesSection />
      </Box>

      <Box as="section" id="pricing">
        <PricingSection onGetStartedClick={handleGetStartedClick} />
      </Box>

      <Box as="section" id="faq">
        <FaqSection />
      </Box>
    </Box>
  );
}


function TestimonialsSection() {
  const columns = useMemo(() => {
    return testimonials.items.reduce<Array<typeof testimonials.items>>(
      (columns, t, i) => {
        columns[i % 3].push(t);

        return columns;
      },
      [[], [], []],
    );
  }, []);

  return (
    <Testimonials
      title={testimonials.title}
      columns={[1, 2, 3]}
      innerWidth="container.xl"
    >
      <>
        {columns.map((column, i) => (
          <Stack key={i} spacing="8">
            {column.map((t, i) => (
              <Testimonial key={i} {...t} />
            ))}
          </Stack>
        ))}
      </>
    </Testimonials>
  );
}

function PricingSection({ onGetStartedClick }: { onGetStartedClick: (planId: string) => void; }) {
  const { tierLimits, loading, error, getTierLimit, formatLimitText } = useTierLimits();

  if (loading) {
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
            <VStack spacing={4}>
              <Spinner size="lg" />
              <Text color="gray.500">Loading pricing information...</Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
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
            <Text color="red.500" textAlign="center">
              Unable to load pricing information. Please try again later.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Create enhanced plans with dynamic limits
  const enhancedPlans = pricing.plans.map(plan => {
    const tierLimit = getTierLimit(plan.id);
    const enhancedFeatures = plan.features.map(feature => {
      if (feature.dynamicKey === "monthly_limit" && tierLimit) {
        return {
          ...feature,
          title: formatLimitText(tierLimit.monthly_limit)
        };
      }
      return feature;
    });

    return {
      ...plan,
      features: enhancedFeatures
    };
  });

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
            {enhancedPlans.map((plan) => (
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
        </VStack>
      </Container>
    </Box>
  );
}

function FaqSection() {
  return <Faq {...faq} />;
}

export default Home;
