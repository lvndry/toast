"use client";

import { CheckCircle2, FileText, Sparkles } from "lucide-react";
import { Variants, motion } from "motion/react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20 mesh-gradient">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto"
        >
          {/* Content Left */}
          <div className="space-y-10 text-left">
            <motion.div variants={item}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Intelligence for Legal Teams
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-secondary leading-[0.95] text-balance"
            >
              Analyze Legal <br />
              <span className="text-primary">Instantly.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium"
            >
              Clausea transforms complex legal documents into clear, actionable
              insights using Retrieval-Augmented Generation (RAG).
            </motion.p>

            <motion.div variants={item} className="space-y-6">
              <div className="p-1 rounded-4xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md group focus-within:ring-2 ring-primary/20 transition-all">
                <form
                  className="flex flex-col sm:flex-row gap-2 p-1.5"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <Input
                    placeholder="Enter your work email"
                    className="h-14 border-none bg-transparent focus-visible:ring-0 text-secondary placeholder:text-muted-foreground/50 font-semibold px-6 text-lg"
                    type="email"
                  />
                  <Button className="h-14 px-10 rounded-3xl bg-primary text-white font-black text-lg hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.95]">
                    Start Free
                  </Button>
                </form>
              </div>

              <div className="flex items-center gap-6 px-4 text-xs font-bold text-secondary/60 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  GDPR Compliant
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="relative"
          >
            {/* Background Glow */}
            <div className="absolute -inset-20 bg-primary/20 rounded-full blur-[150px] opacity-20 animate-pulse-glow"></div>

            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] group bg-white/5 backdrop-blur-sm">
              <Image
                src="/clausea-hero-premium.png"
                alt="Clausea Premium Interface"
                width={1200}
                height={900}
                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-secondary/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Floating Tags */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -left-10 p-6 rounded-3xl bg-secondary text-white shadow-2xl hidden xl:block"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">
                    Scanning
                  </p>
                  <p className="text-lg font-bold italic">MSA_v2.pdf</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-10 -right-10 p-8 rounded-3xl bg-white border border-border shadow-2xl hidden xl:block"
            >
              <p className="text-5xl font-black text-primary tracking-tighter">
                98%
              </p>
              <p className="text-[10px] uppercase tracking-widest font-black text-secondary/40 mt-1">
                Accuracy in RAG
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
