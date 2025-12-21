"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden w-full">
      <div className="w-full container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] bg-secondary px-8 py-24 md:px-20 text-center overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,123,255,0.15)_0,transparent_50%)]" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(0,123,255,0.1)_0,transparent_50%)]" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              Ready to automate?
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.95]">
              Empower your Legal <br />
              team <span className="text-primary italic">Today.</span>
            </h2>

            <p className="text-xl text-white/50 leading-relaxed font-medium max-w-2xl mx-auto">
              Join dozens of forward-thinking legal departments using Clausea
              to save 50+ hours per month on document review.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                size="lg"
                className="h-16 px-12 text-lg font-black rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                asChild
              >
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 text-lg font-black rounded-2xl border-white/10 text-white hover:bg-white/5 transition-all w-full sm:w-auto"
                asChild
              >
                <Link href="/demo">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
