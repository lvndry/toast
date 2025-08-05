"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={8} align="center">
        <VStack spacing={4} textAlign="center">
          <Heading size="2xl">Welcome Back</Heading>
          <Text color="gray.600" fontSize="lg">
            Sign in to your ToastAI account to continue
          </Text>
        </VStack>
        <Box w="full" maxW="400px">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              }
            }}
          />
        </Box>
      </VStack>
    </Container>
  );
}
