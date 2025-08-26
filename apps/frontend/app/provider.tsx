"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ClerkProvider } from "@clerk/nextjs"
import { theme } from "@theme"

import { PostHogProvider } from "../components/PostHogProvider"

export function Provider(props: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ClerkProvider>
        <ChakraProvider theme={theme}>{props.children}</ChakraProvider>
      </ClerkProvider>
    </PostHogProvider>
  )
}
