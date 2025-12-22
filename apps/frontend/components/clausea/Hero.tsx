"use client";

import gsap from "gsap";
import { Anchor, ArrowRight, Waves } from "lucide-react";
import dynamic from "next/dynamic";

import { Suspense, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-transparent" />,
});

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Staggered reveal animation
      tl.from(".hero-badge", {
        y: 30,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          ".hero-title-line",
          {
            y: 80,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
          },
          "-=0.4",
        )
        .from(
          ".hero-description",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6",
        )
        .from(
          ".hero-cta",
          {
            scale: 0.9,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.4",
        )
        .from(
          ".hero-stat",
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          "-=0.4",
        );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-4 md:px-8 ocean-gradient bg-background"
    >
      {/* Ambient ocean glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[180px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/6 rounded-full blur-[160px] pointer-events-none animate-ripple" />

      {/* Subtle wave pattern */}
      <div className="absolute inset-0 wave-pattern opacity-30 pointer-events-none" />

      <Suspense
        fallback={<div className="absolute inset-0 z-0 bg-transparent" />}
      >
        <Scene />
      </Suspense>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        <div ref={textRef} className="flex-1 text-left">
          {/* Badge */}
          <div className="hero-badge mb-8 flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-5 py-2 rounded-full w-fit backdrop-blur-sm">
            <Waves className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
              Navigate Legal Depths
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-10 font-display font-bold leading-[0.9] tracking-tighter">
            <span className="hero-title-line block text-5xl md:text-7xl lg:text-8xl text-primary">
              Legal documents
            </span>
            <span className="hero-title-line block text-5xl md:text-7xl lg:text-8xl text-secondary font-serif italic font-normal tracking-normal my-2">
              were not written for you...
            </span>
            <span className="hero-title-line block text-5xl md:text-7xl lg:text-8xl text-primary">
              <span className="relative inline-block">
                <span className="text-accent">until now</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C40 2 80 7 120 4C160 1 180 6 199 3.5"
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-50"
                  />
                </svg>
              </span>
              .
            </span>
          </h1>

          {/* Description */}
          <p className="hero-description text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed font-medium">
            <span className="text-primary/90">Dive deep into clarity.</span>{" "}
            Clausea AI transforms dense legal jargon into crystalline insights,
            surfacing the risks and rights hidden beneath the surface.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row items-start gap-5">
            <Button
              size="lg"
              className="group h-16 px-10 rounded-full text-lg font-bold uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_50px_hsla(185,70%,50%,0.25)] relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Exploring
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 shimmer" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 rounded-full text-lg font-bold uppercase tracking-widest border-primary/15 hover:border-secondary/50 hover:bg-secondary/5 backdrop-blur-sm transition-all duration-300"
            >
              <Anchor className="mr-3 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="my-16 flex items-center gap-8 border-t border-primary/10 pt-10 max-w-2xl">
            <div className="hero-stat space-y-1">
              <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                10<span className="text-secondary">s</span>
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                Avg. Analysis
              </p>
            </div>
            <div className="h-12 w-px bg-primary/10" />
            <div className="hero-stat space-y-1">
              <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                99.8<span className="text-secondary">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                RAG Accuracy
              </p>
            </div>
            <div className="h-12 w-px bg-primary/10" />
            <div className="hero-stat space-y-1">
              <p className="text-3xl md:text-4xl font-display font-bold text-accent">
                5k<span className="text-secondary">+</span>
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                Legal Teams
              </p>
            </div>
          </div>
        </div>

        {/* 3D Scene placeholder */}
        <div className="flex-1 w-full lg:max-w-md hidden lg:block">
          <div className="h-[500px]" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
