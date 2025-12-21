"use client";

import gsap from "gsap";
import { Cpu, FileText, Globe, History, Layers, Search } from "lucide-react";

import { useRef } from "react";

import { useGSAP } from "@gsap/react";

const features = [
  {
    title: "RAG-Powered Queries",
    description:
      "Search across thousands of policies with semantic precision. Ask complex legal questions and get referenced answers.",
    icon: Search,
    color: "bg-blue-500/10 text-blue-500",
    size: "lg",
  },
  {
    title: "Multi-Document Context",
    description:
      "Compare terms of service across multiple companies side-by-side automatically.",
    icon: Layers,
    color: "bg-purple-500/10 text-purple-500",
    size: "sm",
  },
  {
    title: "Instant Summarization",
    description:
      "Condense 100-page privacy policies into 5 actionable bullet points.",
    icon: FileText,
    color: "bg-amber-500/10 text-amber-500",
    size: "sm",
  },
  {
    title: "Version Intelligence",
    description:
      "Track how policies change over time and see exactly what's new for you.",
    icon: History,
    color: "bg-emerald-500/10 text-emerald-500",
    size: "sm",
  },
  {
    title: "AI Compliance Officer",
    description:
      "Automated risk assessment based on industry standards and local regulations.",
    icon: Cpu,
    color: "bg-rose-500/10 text-rose-500",
    size: "lg",
  },
  {
    title: "Global Regulation Map",
    description:
      "Cross-reference documents against GDPR, CCPA, and hundreds of global laws.",
    icon: Globe,
    color: "bg-indigo-500/10 text-indigo-500",
    size: "sm",
  },
];

export default function AsymmetricGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 md:px-8 bg-background overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-secondary">
            Infrastructure
          </h2>
          <p className="text-5xl md:text-7xl font-display font-bold text-primary tracking-tighter">
            Smarter Analysis.{" "}
            <span className="text-secondary font-serif italic font-normal tracking-normal border-b-[2px] border-secondary/20 pb-2">
              Superior Insights.
            </span>
          </p>
        </div>

        <div className="feature-grid grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[280px] md:auto-rows-[340px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card group relative p-10 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-secondary/50 transition-all duration-700 cursor-pointer overflow-hidden backdrop-blur-sm ${
                feature.size === "lg" ? "md:col-span-2" : "md:col-span-1"
              }`}
            >
              <div className="relative z-10 h-full flex flex-col">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10 bg-white/5 text-secondary group-hover:scale-110 group-hover:bg-secondary group-hover:text-primary transition-all duration-500`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>

                <h3 className="text-3xl font-display font-bold text-primary mb-5 group-hover:translate-x-1 transition-transform duration-500">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm group-hover:text-primary/70 transition-colors duration-500">
                  {feature.description}
                </p>

                <div className="mt-auto opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 text-sm font-bold text-secondary uppercase tracking-widest">
                  Explore Feature <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Decorative hover patterns */}
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700">
                <feature.icon className="w-48 h-48 -rotate-12 translate-x-16 -translate-y-16" />
              </div>

              {/* Premium Glow Effect */}
              <div className="absolute -inset-1 bg-linear-to-r from-secondary/0 via-secondary/10 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </section>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
