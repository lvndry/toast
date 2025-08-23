"use client";

import { Box, Container, Flex, HStack, Text } from "@chakra-ui/react";

export interface HeaderProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function Header(props: HeaderProps) {
  const { children, ...rest } = props;

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200" {...rest}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" py={4}>
          <Text fontSize="xl" fontWeight="bold">
            Toast AI
          </Text>
          <HStack gap={6}>
            {children}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
