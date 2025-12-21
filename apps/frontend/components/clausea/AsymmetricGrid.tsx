"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Cpu,
  FileText,
  Globe,
  History,
  Layers,
  Search,
} from "lucide-react";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";

const features = [
  {
    title: "RAG-Powered Queries",
    description:
      "Search across thousands of policies with semantic precision. Ask complex legal questions and get referenced answers.",
    icon: Search,
    gradient: "from-secondary/20 to-accent/10",
    iconColor: "text-secondary",
    size: "lg",
  },
  {
    title: "Multi-Document Context",
    description:
      "Compare terms of service across multiple companies side-by-side automatically.",
    icon: Layers,
    gradient: "from-accent/20 to-secondary/10",
    iconColor: "text-accent",
    size: "sm",
  },
  {
    title: "Instant Summarization",
    description:
      "Condense 100-page privacy policies into 5 actionable bullet points.",
    icon: FileText,
    gradient: "from-secondary/15 to-ocean/10",
    iconColor: "text-secondary",
    size: "sm",
  },
  {
    title: "Version Intelligence",
    description:
      "Track how policies change over time and see exactly what's new for you.",
    icon: History,
    gradient: "from-accent/15 to-seafoam/10",
    iconColor: "text-accent",
    size: "sm",
  },
  {
    title: "AI Compliance Officer",
    description:
      "Automated risk assessment based on industry standards and local regulations.",
    icon: Cpu,
    gradient: "from-coral/15 to-secondary/10",
    iconColor: "text-coral",
    size: "lg",
  },
  {
    title: "Global Regulation Map",
    description:
      "Cross-reference documents against GDPR, CCPA, and hundreds of global laws.",
    icon: Globe,
    gradient: "from-secondary/20 to-accent/15",
    iconColor: "text-secondary",
    size: "sm",
  },
];

export default function AsymmetricGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useGSAP(
    () => {
      if (hasAnimated.current) return;

      const cards = containerRef.current?.querySelectorAll(".feature-card");
      if (!cards || cards.length === 0) return;

      gsap.set(cards, { opacity: 0, y: 60 });

      ScrollTrigger.create({
        trigger: ".feature-grid",
        start: "top 80%",
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          });
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 md:px-8 bg-background overflow-hidden relative"
    >
      {/* Background ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/4 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-secondary bg-secondary/10 border border-secondary/20 px-5 py-2 rounded-full">
            <Layers className="w-4 h-4" />
            Deep Capabilities
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary tracking-tighter">
            Surface the{" "}
            <span className="text-gradient-ocean font-serif italic font-normal tracking-normal">
              Hidden Depths.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Powerful AI tools designed to navigate complex legal waters with
            precision and speed.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="feature-grid grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] md:auto-rows-[320px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card group relative p-8 md:p-10 rounded-3xl bg-linear-to-br ${feature.gradient} border border-white/5 hover:border-secondary/30 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-sm ${
                feature.size === "lg" ? "md:col-span-2" : "md:col-span-1"
              }`}
            >
              {/* Card content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 bg-white/5 ${feature.iconColor} group-hover:scale-110 group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:border-secondary/50 transition-all duration-500`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4 group-hover:translate-x-1 transition-transform duration-500">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-base leading-relaxed max-w-sm group-hover:text-primary/70 transition-colors duration-500">
                  {feature.description}
                </p>

                {/* Hover CTA */}
                <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 text-sm font-bold text-secondary uppercase tracking-widest">
                  Explore Feature <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Decorative background icon */}
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700">
                <feature.icon className="w-48 h-48 -rotate-12 translate-x-16 -translate-y-16" />
              </div>

              {/* Hover glow effect */}
              <div className="absolute -inset-1 bg-linear-to-r from-secondary/0 via-secondary/10 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
