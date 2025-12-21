"use client";

import NextLink from "next/link";

import { cn } from "@/lib/utils";
import siteConfig from "@data/config";

export interface FooterProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function Footer(props: FooterProps) {
  const { children, className, ...rest } = props;

  return (
    <footer className={cn("bg-muted/30 py-12", className)} {...rest}>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {children}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <NextLink
              href={siteConfig.privacyUrl ?? "/privacy"}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </NextLink>
            <NextLink
              href={siteConfig.termsUrl ?? "/terms"}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </NextLink>
            <NextLink
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </NextLink>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Clausea. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
