"use client";

import { ArrowRight, Cpu, Download, Search, Upload } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    title: "Upload & Connect",
    description:
      "Upload PDFs, Docx, or simply paste a URL. We support bulk imports from Google Drive and law firms.",
    icon: Upload,
  },
  {
    title: "AI Analysis",
    description:
      "Our legal-trained LLMs scan the document, identifying clauses, risks, and hidden data traps.",
    icon: Cpu,
  },
  {
    title: "Query & Discover",
    description:
      'Ask natural language questions like "What is the termination clause?" and get instant answers with citations.',
    icon: Search,
  },
  {
    title: "Export & Share",
    description:
      "Generate professional compliance reports and export them to PDF or your internal legal dashboard.",
    icon: Download,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4"
          >
            The Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black tracking-tighter text-secondary mb-6"
          >
            From Document to <span className="text-primary">Insight</span> in 4
            Steps
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Our streamlined workflow is designed for speed and precision. No
            more manual scanning.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden lg:block" />

          <div className="grid lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => (
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
                className="group flex flex-col items-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-[2rem] bg-white border-2 border-border flex items-center justify-center text-secondary relative z-10 transition-all duration-500 group-hover:bg-primary group-hover:border-primary group-hover:text-white group-hover:rotate-6 group-hover:scale-110 shadow-lg">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white text-xs font-black flex items-center justify-center border-4 border-white z-20">
                    {index + 1}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-border lg:hidden" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
