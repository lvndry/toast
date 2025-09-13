"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

import { useEffect } from "react";

import { env, isDevelopment } from "@lib/env";
import { trackSession } from "../lib/analytics";

export function PostHogProvider({ children }: { children: React.ReactNode; }) {
  useEffect(() => {
    if (!env?.NEXT_PUBLIC_POSTHOG_KEY) {
      return;
    }

    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      debug: isDevelopment,
    });

    // Track session start
    trackSession.started();

    // Track session end when user leaves
    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor(
        (Date.now() - performance.timeOrigin) / 1000,
      );
      trackSession.ended(sessionDuration);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
