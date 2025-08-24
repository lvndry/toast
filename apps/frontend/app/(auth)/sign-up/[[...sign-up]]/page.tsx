import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
            afterSignUpUrl="/onboarding"
          />
        </Box>
      </VStack>
    </Container>
  );
}
