"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileText, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32">
      {/* Light, Subtle Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-white to-white"></div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="w-full container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Copy - More Compelling */}
          <div className="text-center space-y-8 mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl leading-[1.1]"
            >
              Terms of service were
              <br />
              <span className="text-gradient">not written for you.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed"
            >
              Until now. Toast AI reads privacy policies in seconds, exposing
              hidden risks and data traps in plain English.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base rounded-full"
                asChild
              >
                <Link href="/companies">
                  Start analyzing free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Free forever • No credit card required
              </p>
            </motion.div>
          </div>

          {/* Visual Demo - More Refined */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-4xl"
          >
            {/* The Document Card - Simpler, More Professional */}
            <div className="relative z-10 rounded-2xl border border-white/10 bg-card/90 backdrop-blur-xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Spotify Privacy Policy
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      12,405 words • Last updated 2 days ago
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                  High Risk
                </div>
              </div>

              {/* Key Findings - Clear and Professional */}
              <div className="space-y-6">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Key Findings
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-red-500/10 text-red-500">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">
                        Data monetization detected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shares listening habits with advertisers
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-red-500/10 text-red-500">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">
                        Indefinite data retention
                      </p>
                      <p className="text-xs text-muted-foreground">
                        No automatic deletion policy
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10"
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-green-500/10 text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">
                        Encrypted transmission
                      </p>
                      <p className="text-xs text-muted-foreground">
                        TLS 1.3 encryption in transit
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10"
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-green-500/10 text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">GDPR compliant</p>
                      <p className="text-xs text-muted-foreground">
                        EU data protection standards
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Risk Score
                  </span>
                  <span className="ml-3 text-2xl font-bold text-red-500">
                    7.5
                    <span className="text-sm text-muted-foreground">/10</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  asChild
                >
                  <Link href="/companies">
                    View full analysis <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Subtle Background Glow */}
            <div className="absolute -inset-x-20 -inset-y-20 bg-primary/5 rounded-full blur-3xl -z-10 opacity-50"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
