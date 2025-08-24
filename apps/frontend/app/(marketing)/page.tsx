"use client";

import {
  Box
} from "@chakra-ui/react";

import FeaturesSection from "@components/features-section";
import HeroSection from "@components/hero-section";
import { HighlightsSection } from "@components/highlights-section";
import { useEffect } from "react";

import { FaqSection } from "../../components/faq-section";
import { PricingSection } from "../../components/pricing-section";
import { TestimonialsSection } from "../../components/testimonials-section";
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

export default Home;
