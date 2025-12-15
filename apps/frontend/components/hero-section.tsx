"use client";

import gsap from "gsap";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";

export default function HeroSection() {
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-badge", {
      opacity: 0,
      y: 20,
      duration: 0.6,
    })
      .from(
        ".hero-title",
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
        },
        "-=0.3",
      )
      .from(
        ".hero-description",
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
        },
        "-=0.4",
      )
      .from(
        ".hero-cta",
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
        },
        "-=0.3",
      )
      .from(
        ".hero-feature",
        {
          opacity: 0,
          y: 15,
          stagger: 0.1,
          duration: 0.5,
        },
        "-=0.3",
      );
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-24 sm:py-32">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Understand any legal document in 60 seconds
            </span>
          </div>

          {/* Title */}
          <h1 className="hero-title mb-6 font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Legal Documents Made{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Crystal Clear
            </span>
          </h1>

          {/* Description */}
          <p className="hero-description mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Transform complex privacy policies and terms of service into plain
            English. Know what you're agreeing to before you sign up.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="group">
              <Link href="/q">
                Get Started Free
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="hero-feature flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>95%+ Accuracy</span>
            </div>
            <div className="hero-feature flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Privacy Focused</span>
            </div>
            <div className="hero-feature flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Instant Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
