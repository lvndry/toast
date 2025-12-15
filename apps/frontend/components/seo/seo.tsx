"use client";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  [key: string]: unknown;
}

/**
 * SEO component stub.
 * Note: next-seo v7 removed NextSeo component. This is kept for API compatibility
 * but currently renders nothing. Consider using Next.js built-in metadata API.
 */
export function SEO(_props: SEOProps) {
  return null;
}
