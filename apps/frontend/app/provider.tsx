"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ChakraProvider } from '@chakra-ui/react'

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
