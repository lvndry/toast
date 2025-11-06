"use client"

import NextLink from "next/link";

import {
  Box,
  Link as ChakraLink,
  Container,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import siteConfig from "@data/config";

export interface FooterProps {
  children?: React.ReactNode
  [key: string]: any
}

export function Footer(props: FooterProps) {
  const { children, ...rest } = props

  return (
    <Box as="footer" bg="gray.50" py={12} {...rest}>
      <Container maxW="container.xl">
        <VStack gap={6}>
          {children}
          <HStack spacing={6} color="gray.600" fontSize="sm">
            <ChakraLink
              as={NextLink}
              href={siteConfig.privacyUrl ?? "/privacy"}
            >
              Privacy
            </ChakraLink>
            <ChakraLink as={NextLink} href={siteConfig.termsUrl ?? "/terms"}>
              Terms
            </ChakraLink>
            <ChakraLink as={NextLink} href="/contact">
              Contact
            </ChakraLink>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            © {new Date().getFullYear()} Toast AI. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
