"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAnalytics } from "../../hooks/useAnalytics";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // Check onboarding status and redirect if incomplete
    (async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });
        if (res.ok) {
          const me = await res.json();
          if (!me?.onboarding_completed) {
            router.push("/onboarding");
          }
        }
      } catch (_) {
        // ignore
      }
    })();
  }, [isLoaded, isSignedIn, router]);

  // Track dashboard page view
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      trackPageView("dashboard");
    }
  }, [isLoaded, isSignedIn, trackPageView]);

  if (!isLoaded) {
    return (
      <Container maxW="container.xl" py={20}>
        <VStack spacing={4}>
          <Heading>Loading...</Heading>
          <Text>Please wait while we verify your authentication.</Text>
        </VStack>
      </Container>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
}
