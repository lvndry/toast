"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="py-12 border-t border-white/5 bg-black/20 w-full">
      <div className="w-full container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              T
            </div>
            <span className="font-semibold tracking-tight">Toast AI</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="mailto:support@toast.ai"
              className="hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Toast AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
