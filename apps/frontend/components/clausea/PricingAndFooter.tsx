"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Anchor,
  CheckCircle2,
  Github,
  Linkedin,
  Mail,
  Twitter,
  Waves,
} from "lucide-react";
import Link from "next/link";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";

/**
 * Pricing Component - Ocean-themed
 */
export function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const tiers = [
    {
      name: "Explorer",
      price: "0",
      description: "Perfect for individuals testing the waters.",
      features: [
        "10 Documents per month",
        "Basic RAG search",
        "Standard Summarization",
        "Email Support",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Navigator",
      price: "49",
      description: "Advanced tools for legal professionals.",
      features: [
        "Unlimited Documents",
        "Advanced Semantic Search",
        "Clause Comparison",
        "Priority Support",
        "Export to PDF/JSON",
      ],
      cta: "Go Navigator",
      popular: true,
    },
    {
      name: "Fleet",
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
      if (hasAnimated.current) return;

      const cards = containerRef.current?.querySelectorAll(".pricing-tier");
      if (!cards || cards.length === 0) return;

      gsap.set(cards, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: ".pricing-grid",
        start: "top 80%",
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          gsap.to(cards, {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.9,
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
      id="pricing"
      className="py-32 px-4 md:px-8 bg-background relative overflow-hidden"
    >
      {/* Background ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-secondary bg-secondary/10 border border-secondary/20 px-5 py-2 rounded-full mb-6">
            <Waves className="w-4 h-4" />
            Pricing Tiers
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary tracking-tighter">
            Chart Your{" "}
            <span className="text-gradient-ocean font-serif italic font-normal tracking-normal">
              Course.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto">
            From solo explorers to enterprise fleets, find the depth of insight
            you need.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`pricing-tier relative p-10 lg:p-12 rounded-3xl border transition-all duration-500 ${
                tier.popular
                  ? "bg-linear-to-br from-secondary/10 to-accent/5 border-secondary/30 scale-100 md:scale-105 z-10 shadow-[0_0_60px_hsla(185,70%,50%,0.1)]"
                  : "bg-white/2 border-white/10 hover:border-white/20 hover:bg-white/3"
              } ${index === 1 ? "md:mt-0" : "md:mt-8"}`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground px-6 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_hsla(185,70%,50%,0.3)]">
                  Most Popular
                </div>
              )}

              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-secondary">
                {tier.name}
              </h4>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-display font-bold text-primary">
                  {tier.price !== "Custom" && "$"}
                  {tier.price}
                </span>
                {tier.price !== "Custom" && (
                  <span className="text-base text-muted-foreground font-medium">
                    /month
                  </span>
                )}
              </div>

              <p className="text-base leading-relaxed mb-8 text-muted-foreground font-medium pb-8 border-b border-white/5">
                {tier.description}
              </p>

              <ul className="space-y-4 mb-10">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm font-medium text-primary/80"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.popular ? "default" : "outline"}
                className={`w-full h-14 rounded-full font-bold uppercase tracking-widest transition-all duration-500 ${
                  tier.popular
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_30px_hsla(185,70%,50%,0.2)]"
                    : "border-white/10 hover:bg-white/5 hover:border-secondary/30"
                }`}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Footer Component - Ocean-themed
 */
export function Footer() {
  return (
    <footer className="bg-background text-foreground pt-24 pb-12 px-4 md:px-8 border-t border-white/5 overflow-hidden relative">
      {/* Subtle wave pattern */}
      <div className="absolute inset-0 wave-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 group-hover:rotate-6 transition-all duration-500">
                <Anchor className="w-6 h-6 text-secondary" />
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
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs font-medium">
              Navigating the depths of legal complexity. Because clarity
              shouldn&apos;t be a luxury.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-500"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            <div className="space-y-6">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Solution
              </h5>
              <ul className="space-y-4">
                {["Features", "Navigator", "Fleet", "Developer API"].map(
                  (l) => (
                    <li key={l}>
                      <Link
                        href="#"
                        className="text-sm font-medium text-muted-foreground hover:text-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {l}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Resources
              </h5>
              <ul className="space-y-4">
                {["Documentation", "Security", "Support", "Legal Blog"].map(
                  (l) => (
                    <li key={l}>
                      <Link
                        href="#"
                        className="text-sm font-medium text-muted-foreground hover:text-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {l}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
                Compliance
              </h5>
              <ul className="space-y-4">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Data Rights",
                  "GDPR",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm font-medium text-muted-foreground hover:text-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] text-secondary">
              Stay in the Loop
            </h5>
            <p className="text-muted-foreground font-medium text-sm">
              Get legal AI insights delivered monthly.
            </p>
            <div className="flex gap-3 p-1.5 bg-white/5 border border-white/10 rounded-full focus-within:border-secondary/50 transition-all duration-500">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-transparent px-5 py-2 text-sm flex-1 outline-none text-primary font-medium placeholder:text-muted-foreground/50"
                aria-label="Email address"
              />
              <Button
                size="icon"
                className="rounded-full w-11 h-11 bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
              >
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            © 2025 Clausea AI. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Link href="#" className="hover:text-secondary transition-colors">
              Status
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Security
            </Link>
            <Link href="#" className="hover:text-secondary transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-secondary/30 to-transparent" />
    </footer>
  );
}
