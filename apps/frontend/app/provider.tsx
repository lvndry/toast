"use client";

import { ThemeProvider } from "next-themes";

import { PostHogProvider } from "@/components/PostHogProvider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { ClerkProvider } from "@clerk/nextjs";

export function Provider(props: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ClerkProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <LenisProvider>{props.children}</LenisProvider>
        </ThemeProvider>
      </ClerkProvider>
    </PostHogProvider>
  );
}
