"use client";

import gsap from "gsap";
import {
  CheckCircle2,
  Gavel,
  Github,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import Link from "next/link";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";

/**
 * Pricing Component
 */
export function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null);

  const tiers = [
    {
      name: "Standard",
      price: "0",
      description: "Perfect for individuals and solo researchers.",
      features: [
        "10 Documents per month",
        "Basic RAG search",
        "Standard Summarization",
        "Email Support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: "49",
      description: "Advanced tools for legal professionals.",
      features: [
        "Unlimited Documents",
        "Advanced Semantic Search",
        "Clause Comparison",
        "Priority Support",
        "Export to PDF/JSON",
      ],
      cta: "Go Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Seamless integration for law firms.",
      features: [
        "Custom AI Models",
        "API access",
        "Dedicated Account Manager",
        "On-premise deployment",
        "SLA Guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  useGSAP(
    () => {
      gsap.from(".pricing-tier", {
        scrollTrigger: {
          trigger: ".pricing-grid",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 md:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-secondary mb-6">
            Investment
          </h2>
          <h3 className="text-5xl md:text-7xl font-display font-bold text-primary tracking-tighter">
            Choose Your{" "}
            <span className="text-secondary font-serif italic font-normal tracking-normal underline decoration-secondary/20 underline-offset-8">
              Level of Insight.
            </span>
          </h3>
        </div>

        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`pricing-tier relative p-12 rounded-4xl border transition-all duration-700 hover:shadow-[0_0_80px_rgba(59,130,246,0.1)] ${
                tier.popular
                  ? "bg-white/[0.03] border-secondary/50 scale-105 z-10 backdrop-blur-3xl"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              } ${index === 1 ? "md:mt-0" : "md:mt-12"}`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-primary px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-secondary/20">
                  Highly Targeted
                </div>
              )}

              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-secondary">
                {tier.name}
              </h4>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-display font-bold text-primary">
                  {tier.price !== "Custom" && "$"}
                  {tier.price}
                </span>
                {tier.price !== "Custom" && (
                  <span className="text-base text-muted-foreground font-medium">
                    /mo
                  </span>
                )}
              </div>

              <p className="text-base leading-relaxed mb-10 text-muted-foreground font-medium pb-10 border-b border-white/5">
                {tier.description}
              </p>

              <ul className="space-y-5 mb-12">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-4 text-sm font-medium text-primary/80"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 text-secondary`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.popular ? "default" : "outline"}
                className={`w-full h-16 rounded-full font-bold uppercase tracking-widest transition-all duration-500 ${
                  tier.popular
                    ? "bg-secondary text-primary hover:bg-secondary/80 shadow-xl shadow-secondary/10"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
    </section>
  );
}

/**
 * Footer Component
 */
export function Footer() {
  return (
    <footer className="bg-background text-foreground pt-32 pb-16 px-6 md:px-8 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:bg-secondary/20 transition-all duration-500">
                <Gavel className="w-6 h-6 text-secondary" />
              </div>
              <span className="font-display font-bold text-3xl tracking-tighter">
                LegalLens{" "}
                <span className="text-secondary font-serif italic font-normal tracking-normal border-b-[1.5px] border-secondary/20">
                  AI
                </span>
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-xs font-medium text-lg">
              Illuminating the shadows of complex legal documentation. Because
              transparency shouldn&apos;t be a luxury.
            </p>
            <div className="flex items-center gap-5">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary hover:border-secondary transition-all duration-500"
                >
                  <Icon className="w-5 h-5 font-bold" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Solution
              </h5>
              <ul className="space-y-5">
                {[
                  "Features",
                  "Professional",
                  "Enterprise",
                  "Developer API",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm font-medium text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 inline-block"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Corporate
              </h5>
              <ul className="space-y-5">
                {[
                  "Documentation",
                  "Security Protocol",
                  "Support Center",
                  "Legal Blog",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm font-medium text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 inline-block"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Compliance
              </h5>
              <ul className="space-y-5">
                {[
                  "Privacy Hub",
                  "Terms of Protocol",
                  "Data Sovereignty",
                  "Global GDPR",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm font-medium text-muted-foreground hover:text-secondary transition-all hover:translate-x-1 inline-block"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Stay Informed
              </h5>
              <p className="text-muted-foreground font-medium text-base">
                Get high-impact legal AI insights delivered to your portal
                monthly.
              </p>
            </div>
            <div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-full focus-within:border-secondary transition-all duration-500">
              <input
                type="email"
                placeholder="Secure email address"
                className="bg-transparent px-6 py-1 text-sm flex-1 outline-none text-primary font-medium"
                aria-label="Email address"
              />
              <Button
                size="icon"
                className="rounded-full w-12 h-12 bg-secondary text-primary hover:bg-secondary/80 shrink-0"
              >
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            © 2025 LegalLens AI System. All rights reserved.
          </p>
          <div className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Link href="#" className="hover:text-secondary transition-colors">
              Infrastructure Status
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Protocol Security
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-linear-to-r from-transparent via-secondary/20 to-transparent" />
    </footer>
  );
}
