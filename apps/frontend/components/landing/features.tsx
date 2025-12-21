"use client";

import {
  ArrowRight,
  Brain,
  FileSearch,
  FileText,
  Globe,
  LayoutGrid,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const features = [
  {
    title: "Instant Summaries",
    description: "Condense 50-page contracts into 5 critical bullet points.",
    benefit: "Understand complex legal jargon in seconds, not hours.",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "RAG Queries",
    description: "Ask natural language questions directly to your documents.",
    benefit: "Find specific clauses or answers without manual Ctrl+F search.",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    title: "Risk Detection",
    description: "AI-powered identification of compliance red flags.",
    benefit: "Automatically flag high-risk liability and privacy traps.",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    title: "Universal Imports",
    description: "Analyze documentation via URL or PDF/Docx upload.",
    benefit: "Seamlessly integrate with Google Drive and public websites.",
    icon: Globe,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    title: "Automated Reports",
    description: "Generate structured compliance reports instantly.",
    benefit: "Export professional PDF insights for stakeholders.",
    icon: LayoutGrid,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "Contextual Search",
    description: "Deep semantic search across your entire document vault.",
    benefit: "Link related sections and clauses across multiple files.",
    icon: FileSearch,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 relative w-full bg-[#F8F9FA]">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="mb-20 space-y-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary font-bold uppercase tracking-widest text-sm"
          >
            Powerful Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black tracking-tight md:text-6xl text-secondary"
          >
            Everything you need for{" "}
            <span className="text-primary italic">Precision</span> Legal
            Analysis
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl"
          >
            Clausea transforms how you interact with legal documents. Save over{" "}
            <span className="text-secondary font-bold">50+ hours</span> per
            month on manual review.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              className="group relative flex flex-col justify-between p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-2"
            >
              <div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 ${feature.bg} ${feature.color}`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-secondary group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-secondary/70 font-semibold text-sm">
                    {feature.description}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.benefit}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Link
                  href="#learn-more"
                  className="inline-flex items-center text-sm font-bold text-primary hover:gap-3 transition-all"
                >
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
