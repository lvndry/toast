"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-32 relative overflow-hidden w-full">
      <div className="w-full container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-8 py-20 md:px-12 text-center overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          {/* Background Glows */}
          <div className="absolute top-0 left-1/4 -mt-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 -mb-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Stop signing blind
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands who analyze privacy policies before accepting.
              Start protecting your privacy today—free forever.
            </p>

            <div className="flex flex-col items-center gap-6 pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg rounded-full"
                asChild
              >
                <Link href="/companies">
                  Start analyzing free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3 analyses per month</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
