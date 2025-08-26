import { z } from "zod";

const envSchema = z.object({
  // Backend configuration
  BACKEND_BASE_URL: z.url().default("http://localhost:8000"),

  // Authentication (Clerk) - Optional in development
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/dashboard"),

  // Analytics (PostHog)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url().optional(),

  // App configuration
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default("false").transform((val) => val === "true"),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.string().default("false").transform((val) => val === "true"),
});

// Parse and validate environment variables
const envParseResult = envSchema.safeParse(process.env);

// Debug environment loading
console.log("🔍 Debug: NODE_ENV =", process.env.NODE_ENV);
console.log("🔍 Debug: BACKEND_BASE_URL =", process.env.BACKEND_BASE_URL);
console.log("🔍 Debug: All process.env keys =", Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_') || key === 'NODE_ENV' || key === 'BACKEND_BASE_URL'));

// Log environment variables in development (server-side only)
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  console.log("🔧 Environment variables:", {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES,
  });
}

if (!envParseResult.success) {
  const errors = envParseResult.error.flatten().fieldErrors;
  console.error("❌ Invalid environment variables:", errors);

  // Provide more helpful error messages
  const missingVars = Object.keys(errors).filter(key =>
    errors[key]?.some(error => error.includes("Required"))
  );

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
  }

  throw new Error(`Invalid environment variables: ${Object.keys(errors).join(", ")}`);
}

export const env = envParseResult.data;

// Type-safe environment variable access
export type Env = typeof env;

// Helper functions for environment-specific logic
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Feature flag helpers
export const isAnalyticsEnabled = env.NEXT_PUBLIC_ENABLE_ANALYTICS;
export const isBetaFeaturesEnabled = env.NEXT_PUBLIC_ENABLE_BETA_FEATURES;
