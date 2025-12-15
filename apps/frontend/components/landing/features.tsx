"use client";

import { motion } from "framer-motion";
import { Brain, FileSearch, Shield, Zap } from "lucide-react";

const features = [
  {
    title: "Instant Analysis",
    description: "Get a comprehensive risk assessment in under 60 seconds",
    benefit:
      "Save hours of manual review. Our AI reads and understands privacy policies faster than any human.",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    title: "Risk Scoring",
    description: "Quantified 0-10 risk ratings based on data practices",
    benefit:
      "Know at a glance if a service is safe, risky, or somewhere in between.",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    title: "Hidden Clause Detection",
    description: "AI-powered identification of buried data collection terms",
    benefit:
      "Expose data selling, indefinite retention, and other red flags hidden in legalese.",
    icon: FileSearch,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Plain English Summaries",
    description: "Complex legal language translated into simple terms",
    benefit: "Understand exactly what you're agreeing to without a law degree.",
    icon: Brain,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

export function Features() {
  return (
    <section className="py-32 relative w-full">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Find what matters, <span className="text-gradient">instantly.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Toast AI augments your privacy awareness with features that
            previously required a legal team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/30 backdrop-blur-sm p-8 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex flex-col space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bg} ${feature.color}`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-foreground/80 font-medium">
                    {feature.description}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.benefit}
                  </p>
                </div>
              </div>

              {/* Subtle Hover Glow */}
              <div
                className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${feature.bg}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
