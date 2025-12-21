"use client";

import gsap from "gsap";
import { Gavel, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";

/**
 * Custom Cursor Component
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    // Check for touch device after mount
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    // Disable on touch devices
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      });
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
      });
    };

    window.addEventListener("mousemove", moveCursor);

    const links = document.querySelectorAll("a, button");
    const enterHandlers: (() => void)[] = [];
    const leaveHandlers: (() => void)[] = [];

    links.forEach((link, i) => {
      enterHandlers[i] = () => {
        gsap.to(cursorRef.current, { scale: 1.5, opacity: 0.5 });
        gsap.to(followerRef.current, { scale: 2, opacity: 0.1 });
      };
      leaveHandlers[i] = () => {
        gsap.to(cursorRef.current, { scale: 1, opacity: 1 });
        gsap.to(followerRef.current, { scale: 1, opacity: 0.3 });
      };
      link.addEventListener("mouseenter", enterHandlers[i]);
      link.addEventListener("mouseleave", leaveHandlers[i]);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      links.forEach((link, i) => {
        link.removeEventListener("mouseenter", enterHandlers[i]);
        link.removeEventListener("mouseleave", leaveHandlers[i]);
      });
    };
  }, [isTouch]);

  // Don't render on touch devices
  if (isTouch) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-secondary rounded-full pointer-events-none z-50"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-secondary/30 rounded-full pointer-events-none z-50 opacity-30"
      />
    </>
  );
}

/**
 * Header Component
 */
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  useGSAP(() => {
    if (isOpen) {
      gsap.to(".mobile-menu", {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power4.out",
      });
      gsap.from(".mobile-nav-link", {
        x: 40,
        opacity: 0,
        stagger: 0.1,
        delay: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(".mobile-menu", {
        x: "100%",
        opacity: 0,
        duration: 0.4,
        ease: "power4.in",
      });
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Companies", href: "/companies" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-6 py-8">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4 rounded-full bg-background/20 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary/10 border border-white/10 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:bg-secondary/20 transition-all duration-500">
            <Gavel className="w-5 h-5 text-secondary" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter text-primary">
            LegalLens{" "}
            <span className="text-secondary font-serif italic font-normal tracking-normal">
              AI
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.2em] transition-all hover:text-secondary",
                  pathname === link.href ? "text-secondary" : "text-primary/40",
                )}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <Link href="/companies">
                  <Button className="hidden sm:flex rounded-full px-8 h-12 font-bold uppercase tracking-widest bg-secondary text-primary hover:bg-secondary/80 shadow-lg shadow-secondary/10">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button className="hidden sm:flex rounded-full px-8 h-12 font-bold uppercase tracking-widest bg-secondary text-primary hover:bg-secondary/80 shadow-lg shadow-secondary/10">
                    Get Started
                  </Button>
                </Link>
              )}
            </>
          )}
          <button
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu fixed inset-0 z-40 bg-background/98 md:hidden translate-x-full opacity-0 flex flex-col items-center justify-center gap-10 p-8">
        <div className="absolute top-10 right-10">
          <button
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="mobile-nav-link text-5xl font-display font-bold text-primary hover:text-secondary transition-colors tracking-tighter"
          >
            {link.name}
          </Link>
        ))}

        <div className="mt-12 flex flex-col gap-6 w-full max-w-sm">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <Link href="/companies" onClick={() => setIsOpen(false)}>
                  <Button
                    size="lg"
                    className="w-full rounded-full h-16 text-xl font-bold uppercase tracking-widest bg-secondary"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                  <Button
                    size="lg"
                    className="w-full rounded-full h-16 text-xl font-bold uppercase tracking-widest bg-secondary"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
