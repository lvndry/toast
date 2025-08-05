"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

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
