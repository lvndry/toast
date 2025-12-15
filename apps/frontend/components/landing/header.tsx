"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-background/50 border-b border-white/5 w-full"
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <span className="font-bold text-xl tracking-tight">Toast AI</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link
          href="#how-it-works"
          className="hover:text-primary transition-colors"
        >
          How it Works
        </Link>
        <Link href="#demo" className="hover:text-primary transition-colors">
          Demo
        </Link>
        <Link href="#pricing" className="hover:text-primary transition-colors">
          Pricing
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">Log in</Link>
        </Button>
        <Button size="sm" className="rounded-full" asChild>
          <Link href="/companies">Get Started</Link>
        </Button>
      </div>
    </motion.header>
  );
}
