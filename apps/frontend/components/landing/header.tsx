"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 w-full ${
        scrolled
          ? "backdrop-blur-xl bg-background/80 border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-110">
            C
          </div>
          <span className="font-bold text-xl tracking-tight text-secondary">
            Clausea
          </span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-secondary/80">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="hover:text-primary transition-colors relative group"
          >
            {item.label}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-secondary hover:text-primary font-semibold"
          >
            <Link href="/sign-in">Log in</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-primary text-white hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20"
            asChild
          >
            <Link href="/sign-up">Sign Up Free</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-secondary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-6 md:hidden shadow-xl"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-lg font-semibold text-secondary hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t">
              <Link href="/sign-in" className="text-secondary font-semibold">
                Log in
              </Link>
              <Button className="w-full bg-primary font-bold shadow-lg shadow-primary/20">
                Sign Up Free
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
