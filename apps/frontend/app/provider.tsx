"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ClerkProvider } from "@clerk/nextjs";

import { theme } from "@theme";

export function Provider(props: { children: React.ReactNode; }) {
  return (
    <ClerkProvider>
      <ChakraProvider theme={theme}>
        {props.children}
      </ChakraProvider>
    </ClerkProvider>
  );
}
