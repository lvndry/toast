"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useAnalytics } from "../../../../hooks/useAnalytics";

export default function SignUpPage() {
  const { trackPageView, trackUserJourney } = useAnalytics();

  // Track sign-up page view
  useEffect(() => {
    trackPageView("sign_up_page");
  }, [trackPageView]);

  // Track sign-up events
  useEffect(() => {
    const handleSignUp = () => {
      trackUserJourney.signUp("clerk");
    };

    // Listen for sign-up success
    window.addEventListener('clerk-sign-up-complete', handleSignUp);

    return () => {
      window.removeEventListener('clerk-sign-up-complete', handleSignUp);
    };
  }, [trackUserJourney]);

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={8} align="center">
        <VStack spacing={4} textAlign="center">
          <Heading size="2xl">Join ToastAI</Heading>
          <Text color="gray.600" fontSize="lg">
            Create your account to start analyzing legal documents
          </Text>
        </VStack>
        <Box w="full" maxW="400px">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              }
            }}
            signInUrl="/sign-in"
            fallbackRedirectUrl="/onboarding"
          />
        </Box>
      </VStack>
    </Container>
  );
}
