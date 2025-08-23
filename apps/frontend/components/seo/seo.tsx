"use client";

import { NextSeo } from "next-seo";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  [key: string]: any;
}

export function SEO(props: SEOProps) {
  return <NextSeo {...props} />;
}
