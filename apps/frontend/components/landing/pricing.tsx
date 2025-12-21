"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for individuals and hobbyists.",
    features: [
      "3 documents per month",
      "Basic AI summaries",
      "URL analysis",
      "Email support",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "Advanced features for professionals.",
    features: [
      "Unlimited documents",
      "RAG-powered queries",
      "Risk assessment scoring",
      "Batch PDF uploads",
      "Priority assistance",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scalable solutions for large teams.",
    features: [
      "Custom LLM training",
      "Advanced API access",
      "Dedicated account manager",
      "SSO & advanced security",
      "Custom data retention",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4"
          >
            Pricing
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-secondary mb-6">
            Transparent Pricing for <span className="text-primary">Every</span>{" "}
            Team
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your legal workflow. Scale as you grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className={`flex flex-col p-10 rounded-[2.5rem] border ${
                tier.highlight
                  ? "bg-secondary text-white border-secondary shadow-2xl scale-105 z-10"
                  : "bg-white text-secondary border-border shadow-sm hover:shadow-xl transition-shadow"
              }`}
            >
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2 opacity-60">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">{tier.price}</span>
                  {tier.price !== "Custom" && (
                    <span className="opacity-60 font-bold">/mo</span>
                  )}
                </div>
                <p className="mt-4 text-sm opacity-60 font-medium">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {tier.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Check
                      className={`h-5 w-5 ${tier.highlight ? "text-primary" : "text-primary"}`}
                    />
                    <span className="text-sm font-semibold">{f}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full h-14 rounded-2xl font-black text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                  tier.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-secondary text-white hover:bg-secondary/90"
                }`}
              >
                {tier.cta} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
