"use client";

import gsap from "gsap";
import { ArrowRight, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";

import { useRef } from "react";

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
      const tl = gsap.timeline();

      tl.from(".hero-line", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
      })
        .from(
          ".hero-cta",
          {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: "back.out(1.7)",
          },
          "-=0.6",
        )
        .from(
          ".trust-badge",
          {
            x: -20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.8",
        );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-4 md:px-8 bg-background"
    >
      <Scene />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        <div ref={textRef} className="flex-1 text-left">
          <div className="trust-badge mb-8 flex items-center gap-2 bg-secondary/5 border border-secondary/10 px-4 py-1.5 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
              Enterprise-Grade Legal AI
            </span>
          </div>

          <h1 className="hero-line text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.9] mb-8 tracking-tighter text-primary">
            Legal documents <br />
            <span className="text-secondary font-serif italic font-normal tracking-normal">
              were not written
            </span>{" "}
            <br />
            for you...{" "}
            <span className="text-accent underline decoration-accent/30 underline-offset-12">
              until now
            </span>
            .
          </h1>

          <p className="hero-line text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 leading-relaxed font-sans font-medium opacity-80">
            Illuminate complexity. LegalLens AI transforms dense legal jargon
            into crystalline insights in seconds. Finally, know exactly what
            you&apos;re signing.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-start gap-5">
            <Button
              size="lg"
              className="h-16 px-10 rounded-full text-lg font-bold uppercase tracking-widest group transition-all hover:scale-105 active:scale-95 bg-secondary text-primary hover:bg-secondary/90 shadow-[0_0_40px_rgba(59,130,246,0.3)] shadow-secondary/20"
            >
              Start Analyzing
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 rounded-full text-lg font-bold uppercase tracking-widest border-primary/10 hover:bg-white/5 backdrop-blur-sm"
            >
              Watch Demo
            </Button>
          </div>

          {/* User Stats/Social Proof */}
          <div className="hero-line my-16 flex items-center gap-10 border-t border-primary/5 pt-10 max-w-2xl">
            <div className="space-y-1">
              <p className="text-3xl font-display font-bold text-primary">
                10s
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                Avg. Analysis
              </p>
            </div>
            <div className="h-12 w-px bg-primary/5" />
            <div className="space-y-1">
              <p className="text-3xl font-display font-bold text-primary">
                99.8%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                RAG Accuracy
              </p>
            </div>
            <div className="h-12 w-px bg-primary/5" />
            <div className="space-y-1">
              <p className="text-3xl font-display font-bold text-primary text-accent">
                5k+
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                Global Firms
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full lg:max-w-md hidden lg:block">
          <div className="h-[500px]" />
        </div>
      </div>

      {/* Decorative radial gradients - more subtle than before */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
    </section>
  );
}
