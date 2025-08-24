"use client";

import { Box, Container, Text, VStack } from "@chakra-ui/react";

export interface FooterProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function Footer(props: FooterProps) {
  const { children, ...rest } = props;

  return (
    <Box as="footer" bg="gray.50" py={12} {...rest}>
      <Container maxW="container.xl">
        <VStack gap={6}>
          {children}
          <Text color="gray.500" fontSize="sm">
            © {new Date().getFullYear()} Toast AI. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
