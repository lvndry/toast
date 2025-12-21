"use client";

import gsap from "gsap";
import { Sparkles, Waves } from "lucide-react";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";

export default function ComplexityToClarity() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scramble = containerRef.current?.querySelector(".scramble-text");
      const clear = containerRef.current?.querySelector(".clear-text");
      const beams = containerRef.current?.querySelectorAll(".beam") || [];

      if (!scramble || !clear) return;

      // Set initial states
      gsap.set(clear, { opacity: 0, scale: 0.95 });
      gsap.set(".clarity-badge", { y: 20, opacity: 0 });
      gsap.set(beams, { opacity: 0, scaleY: 0.5 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 20%",
          end: "bottom top",
          pin: true,
          scrub: 1.5,
        },
      });

      // Transition animation
      tl.to(scramble, {
        opacity: 0,
        filter: "blur(12px)",
        scale: 0.9,
        duration: 1,
      })
        .to(
          clear,
          {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1,
          },
          "-=0.6",
        )
        .to(
          ".clarity-badge",
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
          },
          "-=0.3",
        );

      // Animate beams
      tl.to(
        beams,
        {
          opacity: 0.15,
          scaleY: 1.5,
          stagger: 0.15,
          duration: 1,
        },
        0,
      );

      // useGSAP handles cleanup automatically via revert()
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="h-screen bg-background text-primary flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Background "Complexity" - Dense Jargon Pattern */}
      <div className="absolute inset-0 opacity-[0.04] select-none pointer-events-none font-mono text-[10px] leading-none whitespace-pre overflow-hidden text-primary/40">
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i}>
            {"PURSUANT TO SUBSECTION 4(A)(II) THE LICENSOR HEREBY DISCLAIMS ALL WARRANTIES EXPRESS OR IMPLIED INCLUDING BUT NOT LIMITED TO MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE NOTWITHSTANDING ANY CONSEQUENTIAL DAMAGES ".repeat(
              5,
            )}
          </div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl text-center px-4">
        {/* Scrambled/Complex State */}
        <div className="scramble-text">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tighter">
            <span className="text-primary">Dense. Overwhelming.</span> <br />
            <span className="text-muted-foreground/60 font-serif italic font-normal tracking-normal">
              Designed to obscure.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-2xl font-medium tracking-tight max-w-3xl mx-auto">
            The average legal policy takes{" "}
            <span className="text-secondary">45 minutes</span> to parse. <br />
            Most sign without ever reading the terms.
          </p>
        </div>

        {/* Clear/Illuminated State */}
        <div className="clear-text absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none">
          <div className="clarity-badge mb-10 flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-6 py-2.5 rounded-full backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
              Crystal Clear
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-9xl font-display font-bold mb-10 leading-[0.9] tracking-tighter">
            <span className="text-primary">Clarity</span>{" "}
            <span className="text-gradient-ocean font-serif italic font-normal tracking-normal">
              surfaces.
            </span>
          </h2>

          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl leading-relaxed font-medium">
            Clausea dives deep, extracting the essential risks. <br />
            <span className="text-primary/90">
              No jargon. No hidden clauses.
            </span>{" "}
            Just the crystalline facts you need.
          </p>

          {/* Social Proof */}
          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full border-2 border-background bg-linear-to-br from-secondary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold text-secondary"
                >
                  <Waves className="w-4 h-4" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Trusted by <span className="text-secondary">5,000+</span> Legal
              Teams
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Light Beams - Ocean-themed */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="beam absolute top-[-50%] w-px h-[200%] origin-top opacity-0"
            style={{
              left: `${15 + i * 14}%`,
              background: `linear-gradient(180deg, transparent 0%, hsla(185, 70%, 50%, 0.25) 50%, transparent 100%)`,
              transform: `rotate(${-5 + i * 2}deg)`,
            }}
          />
        ))}
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
