"use client";

import { Box, Container, Icon, Stack } from "@chakra-ui/react";
import { ButtonLink } from "@components/button-link/button-link";
import { BackgroundGradient } from "@components/gradients/background-gradient";
import { Hero } from "@components/hero";
import { FallInPlace } from "@components/motion/fall-in-place";
import { FiArrowRight } from "react-icons/fi";

export default function HeroSection() {
  return (
    <Box position="relative" overflow="hidden">
      <BackgroundGradient height="100%" zIndex="-1" />
      <Container maxW="container.xl" pt={{ base: 40, lg: 60 }} pb="40">
        <Stack direction={{ base: "column", lg: "row" }} alignItems="center">
          <Hero
            id="home"
            justifyContent="flex-start"
            px="0"
            title={
              <FallInPlace>
                Understand Legal Documents in
                <br /> Seconds, Not Hours
              </FallInPlace>
            }
            description={
              <FallInPlace delay={0.4} fontWeight="medium">
                Search thousands of pre-analyzed companies and instantly understand their terms of service,
                <br /> privacy policies, and legal agreements. Plus, ask our AI assistant any follow-up questions.
              </FallInPlace>
            }
          >
            <FallInPlace delay={0.8} paddingY={4}>
              <Stack direction="row" spacing={4}>
                <ButtonLink colorScheme="primary" size="lg" href="/sign-up">
                  Try Demo
                </ButtonLink>
                <ButtonLink
                  size="lg"
                  href="/companies"
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
                  Go to App
                </ButtonLink>
              </Stack>
            </FallInPlace>
          </Hero>
        </Stack>
      </Container>
    </Box>
  );
}
