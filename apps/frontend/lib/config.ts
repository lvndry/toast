import { env, isAnalyticsEnabled, isBetaFeaturesEnabled } from "./env";

// Backend URL helpers
export function getBackendUrl(path: string = "") {
  const baseUrl = env.BACKEND_BASE_URL.replace(/\/$/, ""); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ""); // Remove leading slash
  return `${baseUrl}/${cleanPath}`;
};


export const apiEndpoints = {
  tierLimits: () => getBackendUrl("/users/tier-limits"),
  documents: () => getBackendUrl("/documents"),
  analysis: () => getBackendUrl("/analysis"),
  conversations: () => getBackendUrl("/conversations"),
  companies: () => getBackendUrl("/companies"),
  q: () => getBackendUrl("/q"),
  users: () => getBackendUrl("/users"),
  metaSummary: (slug: string) => getBackendUrl(`/companies/${slug}/meta-summary`),
} as const;

// Application configuration
export const config = {
  // App configuration
  app: {
    name: "Toast AI",
    version: "1.0.0",
    url: env.NEXT_PUBLIC_APP_URL,
    environment: env.NODE_ENV,
  },

  // Backend configuration
  backend: {
    baseUrl: env.BACKEND_BASE_URL,
    timeout: 30000, // 30 seconds
    retries: 3,
  },

  // Feature flags
  features: {
    analytics: isAnalyticsEnabled,
    betaFeatures: isBetaFeaturesEnabled,
  },

  // Authentication configuration
  auth: {
    signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    afterSignInUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    afterSignUpUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  },
} as const;
