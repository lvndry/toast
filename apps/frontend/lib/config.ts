// Backend URL helpers
export function getBackendUrl(path: string = "") {
  const baseUrl = (process.env.BACKEND_BASE_URL || "http://localhost:8000").replace(/\/$/, ""); // Remove trailing slash
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
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },

  // Backend configuration
  backend: {
    baseUrl: process.env.BACKEND_BASE_URL || "http://localhost:8000",
    timeout: 30000, // 30 seconds
    retries: 3,
  },

  // Feature flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    betaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === "true",
  },

  // Authentication configuration
  auth: {
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard",
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard",
  },
} as const;
