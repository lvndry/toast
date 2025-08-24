"use client";

import { Box, Button, Link as ChakraLink, Container, Flex, HStack } from "@chakra-ui/react";
import siteConfig from "@data/config";
import { useAuthStatus } from "@hooks/useAuthStatus";
import NextLink from "next/link";
import { Logo } from "./logo";

export interface HeaderProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function Header(props: HeaderProps) {
  const { children, ...rest } = props;
  const { isSignedIn, isLoading } = useAuthStatus();

  const defaultNav = (
    <HStack gap={6}>
      {siteConfig.header?.links?.map((item: any) => {
        const href = item.id ? `/#${item.id}` : item.href;
        const isPrimary = item.variant === "primary";
        if (isPrimary) {
          return (
            <NextLink key={item.label} href={href} passHref legacyBehavior>
              <Button as="a" colorScheme="primary" size="sm">
                {item.label}
              </Button>
            </NextLink>
          );
        }
        return (
          <ChakraLink as={NextLink} key={item.label ?? href} href={href} color="gray.700" _hover={{ color: "gray.900" }}>
            {item.label}
          </ChakraLink>
        );
      })}
    </HStack>
  );

  const authenticatedNav = (
    <HStack gap={6}>
      <NextLink href="/companies" passHref legacyBehavior>
        <Button as="a" colorScheme="primary" size="sm">
          Go to App
        </Button>
      </NextLink>
    </HStack>
  );

  return (
    <Box as="header" bg="white" borderBottom="1px" borderColor="gray.200" {...rest}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" py={4}>
          <Logo />
          <HStack gap={6}>
            {children ?? (!isLoading && isSignedIn ? authenticatedNav : defaultNav)}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
