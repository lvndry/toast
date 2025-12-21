"use client";

import { Clock, ShieldAlert, TrendingDown } from "lucide-react";
import { motion } from "motion/react";

const painPoints = [
  {
    icon: Clock,
    stat: "70%",
    label: "Efficiency Loss",
    description:
      "Legal teams spend most of their time manually scanning through 100+ page contracts.",
  },
  {
    icon: ShieldAlert,
    stat: "42%",
    label: "Risk Exposure",
    description:
      "Compliance gaps often remain hidden in dense legal jargon and nested clauses.",
  },
  {
    icon: TrendingDown,
    stat: "$2.4M",
    label: "Ops Cost",
    description:
      "Average annual cost of manual document review for mid-sized legal departments.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-primary font-black uppercase tracking-[0.2em] text-xs">
                The Problem
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-secondary tracking-tighter leading-[0.95]">
                Manual Legal Review <br />
                is <span className="text-primary italic">Expensive</span> &
                Unstable.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Traditional legal workflows can't keep up with the volume of
                modern digital agreements. Human error and fatigue lead to
                missed liabilities.
              </p>

              <div className="pt-8 border-t border-border flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-secondary italic overflow-hidden"
                    >
                      <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                        JD
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-secondary">
                  Trusted by over 100+ Legal Counsels
                </p>
              </div>
            </motion.div>

            <div className="grid gap-6">
              {painPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 rounded-3xl bg-[#F8F9FA] border border-border hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <point.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-secondary">
                          {point.stat}
                        </span>
                        <span className="text-sm font-black uppercase tracking-widest text-primary italic">
                          {point.label}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground text-sm font-medium leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
