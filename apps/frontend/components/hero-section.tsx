"use client"

import { FiArrowRight, FiCheckCircle } from "react-icons/fi"

import {
  Box,
  Container,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { ButtonLink } from "@components/button-link/button-link"
import { BackgroundGradient } from "@components/gradients/background-gradient"
import { Hero } from "@components/hero"
import { FallInPlace } from "@components/motion/fall-in-place"
import { useAuthStatus } from "@hooks/useAuthStatus"

export default function HeroSection() {
  const { isSignedIn, isLoading } = useAuthStatus()

  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" py={20}>
        <Stack direction={{ base: "column", lg: "row" }} alignItems="center">
          <Hero
            id="home"
            justifyContent="flex-start"
            px="0"
            title={
              <FallInPlace>
                Terms of services were not written for you...
                <br /> Until now.
              </FallInPlace>
            }
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                Ever clicked "I agree" without reading? Yeah, us too. That's why
                we built this.
                <br /> Search thousands of privacy policies and terms made easy
                to understand with AI. Know the risks, ask follow-up questions,
                and actually understand what you're signing.
              </FallInPlace>
            }
            action={
              <VStack align="flex-start" spacing={4}>
                <FallInPlace delay={0.8}>
                  <Stack direction="row" spacing={4}>
                    {!isLoading && isSignedIn ? (
                      <ButtonLink
                        colorScheme="primary"
                        size="lg"
                        href="/companies"
                      >
                        Go to App
                      </ButtonLink>
                    ) : (
                      <ButtonLink
                        colorScheme="primary"
                        size="lg"
                        href="#pricing"
                      >
                        Get started free
                      </ButtonLink>
                    )}
                    <ButtonLink
                      size="lg"
                      href="#features"
                      variant="outline"
                      rightIcon={
                        <Icon
                          as={FiArrowRight}
                          sx={{
                            transitionProperty: "common",
                            transitionDuration: "normal",
                            ".chakra-button:hover &": {
                              transform: "translate(5px)",
                            },
                          }}
                        />
                      }
                    >
                      See features
                    </ButtonLink>
                  </Stack>
                </FallInPlace>
                <FallInPlace delay={1.0}>
                  <HStack spacing={6} color="gray.600">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">
                        95%+ accuracy on validated legal patterns
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">
                        Sub-10s analysis for standard policies
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text fontSize="sm">GDPR/CCPA-aware</Text>
                    </HStack>
                  </HStack>
                </FallInPlace>
              </VStack>
            }
          />
        </Stack>
      </Container>
    </Box>
  )
}
