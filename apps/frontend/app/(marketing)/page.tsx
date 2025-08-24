"use client";

import {
  Box,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VStack
} from "@chakra-ui/react";

import { Faq } from "@components/faq";
import FeaturesSection from "@components/features-section";
import HeroSection from "@components/hero-section";
import { HighlightsSection } from "@components/highlights-section";
import { Pricing } from "@components/pricing/pricing";
import { Testimonial, Testimonials } from "@components/testimonials";
import faq from "@data/faq";
import pricing from "@data/pricing";
import testimonials from "@data/testimonials";
import { useEffect, useMemo } from "react";

import { useAnalytics } from "../../hooks/useAnalytics";

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

      <HighlightsSection />

      <FeaturesSection />

      <TestimonialsSection />

      <PricingSection onGetStartedClick={handleGetStartedClick} />

      <FaqSection />
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
  return (
    <Box py={16}>
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
            <Pricing
              key={plan.id}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              features={plan.features.map(f => f.title)}
              action={
                <Link
                  href={plan.action.href}
                  onClick={() => onGetStartedClick(plan.id)}
                >
                  Get Started
                </Link>
              }
            />
          ))}
        </SimpleGrid>

        <Text p="8" textAlign="center" color="gray.500">
          Free tier includes 10 company searches per month. VAT may be applicable depending on your location.
        </Text>
      </VStack>
    </Box>
  );
}

function FaqSection() {
  return <Faq {...faq} />;
}

export default Home;
