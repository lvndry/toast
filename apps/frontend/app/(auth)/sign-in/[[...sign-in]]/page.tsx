"use client"

import { useEffect } from "react"

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react"
import { SignIn } from "@clerk/nextjs"

import { useAnalytics } from "../../../../hooks/useAnalytics"

export default function SignInPage() {
  const { trackPageView, trackUserJourney } = useAnalytics()

  // Track sign-in page view
  useEffect(() => {
    trackPageView("sign_in_page")
  }, [trackPageView])

  // Track sign-in events
  useEffect(() => {
    const handleSignIn = () => {
      trackUserJourney.signIn("clerk")
    }

    // Listen for sign-in success
    window.addEventListener("clerk-sign-in-complete", handleSignIn)

    return () => {
      window.removeEventListener("clerk-sign-in-complete", handleSignIn)
    }
  }, [trackUserJourney])

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
              },
            }}
          />
        </Box>
      </VStack>
    </Container>
  )
}
