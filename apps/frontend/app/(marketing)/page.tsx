"use client";

import {
  Box,
  Stack,
  Text
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
import { useMemo } from "react";

function Home() {
  return (
    <Box>
      <HeroSection />

      <HighlightsSection />

      <FeaturesSection />

      <TestimonialsSection />

      <PricingSection />

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

function PricingSection() {
  return (
    <Pricing {...pricing}>
      <Text p="8" textAlign="center" color="muted">
        Free tier includes 10 company searches per month. VAT may be applicable depending on your location.
      </Text>
    </Pricing>
  );
}

function FaqSection() {
  return <Faq {...faq} />;
}

export default Home;
