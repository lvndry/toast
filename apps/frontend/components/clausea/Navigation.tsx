"use client";

import gsap from "gsap";
import { Anchor, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";

/**
 * Custom Cursor Component - Ocean-themed
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      gsap.to(followerRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.35,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", moveCursor);

    const links = document.querySelectorAll("a, button");
    const enterHandlers: (() => void)[] = [];
    const leaveHandlers: (() => void)[] = [];

    links.forEach((link, i) => {
      enterHandlers[i] = () => {
        gsap.to(cursorRef.current, {
          scale: 1.8,
          opacity: 0.6,
          duration: 0.3,
        });
        gsap.to(followerRef.current, {
          scale: 2.5,
          opacity: 0.1,
          duration: 0.3,
        });
      };
      leaveHandlers[i] = () => {
        gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.3 });
        gsap.to(followerRef.current, {
          scale: 1,
          opacity: 0.25,
          duration: 0.3,
        });
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

  if (isTouch) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-secondary rounded-full pointer-events-none z-100 mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 border border-secondary/40 rounded-full pointer-events-none z-100 opacity-25"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </>
  );
}

/**
 * Header Component - Ocean-themed
 */
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(
    () => {
      if (isOpen) {
        gsap.to(".mobile-menu", {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power4.out",
        });
        gsap.from(".mobile-nav-link", {
          x: 50,
          opacity: 0,
          stagger: 0.08,
          delay: 0.2,
          ease: "power3.out",
        });
      } else {
        gsap.to(".mobile-menu", {
          x: "100%",
          opacity: 0,
          duration: 0.4,
          ease: "power4.in",
        });
      }
    },
    { scope: headerRef, dependencies: [isOpen] },
  );

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Companies", href: "/companies" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-40 px-4 md:px-6 py-6"
    >
      <nav
        className={cn(
          "max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-4 rounded-full transition-all duration-500",
          scrolled
            ? "bg-background/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_hsla(210,50%,6%,0.4)]"
            : "bg-transparent",
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 group-hover:border-secondary/40 group-hover:rotate-6 transition-all duration-500">
            <Anchor className="w-5 h-5 text-secondary" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            <span className="text-primary">Clause</span>
            <span className="text-secondary font-serif italic font-normal">
              a
            </span>
            <span className="text-accent ml-1 text-lg font-sans font-medium opacity-60">
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
                  "relative text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 py-2",
                  pathname === link.href
                    ? "text-secondary"
                    : "text-primary/50 hover:text-primary",
                )}
              >
                {link.name}
                {pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <Link href="/companies">
                  <Button className="hidden sm:flex rounded-full px-8 h-12 font-bold uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_30px_hsla(185,70%,50%,0.2)] transition-all duration-300">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button className="hidden sm:flex rounded-full px-8 h-12 font-bold uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_30px_hsla(185,70%,50%,0.2)] transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-secondary/30 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu fixed inset-0 z-40 bg-background/98 backdrop-blur-xl md:hidden translate-x-full opacity-0 flex flex-col items-center justify-center gap-8 p-8">
        <button
          className="absolute top-8 right-8 w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-secondary/30 transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Mobile Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-14 h-14 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center">
            <Anchor className="w-7 h-7 text-secondary" />
          </div>
        </div>

        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="mobile-nav-link text-4xl md:text-5xl font-display font-bold text-primary hover:text-secondary transition-colors tracking-tighter"
          >
            {link.name}
          </Link>
        ))}

        <div className="mt-12 flex flex-col gap-4 w-full max-w-sm">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <Link href="/companies" onClick={() => setIsOpen(false)}>
                  <Button
                    size="lg"
                    className="w-full rounded-full h-16 text-lg font-bold uppercase tracking-widest bg-secondary text-secondary-foreground shadow-[0_0_40px_hsla(185,70%,50%,0.25)]"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                  <Button
                    size="lg"
                    className="w-full rounded-full h-16 text-lg font-bold uppercase tracking-widest bg-secondary text-secondary-foreground shadow-[0_0_40px_hsla(185,70%,50%,0.25)]"
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
