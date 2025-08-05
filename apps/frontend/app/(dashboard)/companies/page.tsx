"use client";

import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useClerk, useUser } from "@clerk/nextjs";
import { FiLogOut } from "react-icons/fi";

export default function CompaniesPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <VStack spacing={8} align="stretch">
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">Welcome to ToastAI</Heading>
          <Text color="gray.600" mt={2}>
            Hello, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </Text>
        </Box>
        <Button
          leftIcon={<FiLogOut />}
          variant="outline"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </HStack>

      <Box p={6} bg="white" rounded="lg" shadow="sm" _dark={{ bg: "gray.800" }}>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Companies Database</Heading>
          <Text color="gray.600">
            Search and analyze legal documents from thousands of companies.
            Our AI has already processed their terms of service, privacy policies,
            and legal agreements for instant access.
          </Text>
          <Text color="gray.500" fontSize="sm">
            This is a protected page - you can only see this because you&apos;re signed in!
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}
