"use client";

import gsap from "gsap";
import { Sparkles } from "lucide-react";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";

export default function ComplexityToClarity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrambleRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 20%",
          end: "bottom top",
          pin: true,
          scrub: 1,
        },
      });

      // Fade out scramble text and fade in clear text
      tl.to(".scramble-text", {
        opacity: 0,
        filter: "blur(10px)",
        scale: 0.9,
        duration: 1,
      })
        .to(
          ".clear-text",
          {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1,
            stagger: 0.1,
          },
          "-=0.5",
        )
        .from(
          ".clarity-badge",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.2",
        );

      // Animate the "beams of light"
      tl.to(
        ".beam",
        {
          opacity: 0.2,
          scaleY: 1.5,
          stagger: 0.2,
          duration: 1,
        },
        0,
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="h-screen bg-background text-primary flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background "Complexity" - Dense Jargon Pattern */}
      <div className="absolute inset-0 opacity-[0.05] select-none pointer-events-none font-mono text-[10px] leading-none whitespace-pre overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i}>
            {"PURSUANT TO SUBSECTION 4(A)(II) THE LICENSOR HEREBY DISCLAIMS ALL WARRANTIES EXPRESS OR IMPLIED INCLUDING BUT NOT LIMITED TO MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE NOTWITHSTANDING ANY CONSEQUENTIAL DAMAGES ".repeat(
              5,
            )}
          </div>
        ))}
      </div>

      {/* Narrative Elements */}
      <div className="relative z-10 max-w-5xl text-center px-4">
        <div className="scramble-text">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tighter">
            Dense. Overwhelming. <br />
            <span className="opacity-40 italic">Designed to hide.</span>
          </h2>
          <p className="text-muted-foreground text-xl md:text-2xl font-medium tracking-tight">
            The average legal policy takes 45 minutes to parse. <br />
            Most sign without ever reading the terms.
          </p>
        </div>

        <div className="clear-text absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none">
          <div className="clarity-badge mb-10 flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-5 py-2 rounded-full backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
              Illuminated
            </span>
          </div>

          <h2 className="text-6xl md:text-9xl font-display font-bold mb-10 leading-[0.9] tracking-tighter">
            Clarity in{" "}
            <span className="text-secondary font-serif italic font-normal tracking-normal">
              Seconds.
            </span>
          </h2>

          <p className="text-muted-foreground text-2xl md:text-3xl max-w-3xl leading-relaxed font-medium">
            LegalLens extracts the essential risks. No jargon, no hidden
            clauses. Just the crystalline facts you need to know.
          </p>

          <div className="mt-16 flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold"
                >
                  LL
                </div>
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary/40">
              Trusted by 5,000+ Legal Professionals
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Light Beams */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="beam absolute top-[-50%] left-[20%] w-px h-[200%] bg-linear-to-b from-transparent via-secondary/20 to-transparent rotate-30 origin-top opacity-0"
            style={{ left: `${20 + i * 15}%` }}
          />
        ))}
      </div>
    </section>
  );
}
