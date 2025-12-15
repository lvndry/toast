"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, FileX } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    stat: "76 work days",
    description:
      "Average time needed to read all privacy policies you encounter yearly",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: AlertTriangle,
    stat: "86%",
    description: "of people never read privacy policies before accepting",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: FileX,
    stat: "Hidden clauses",
    description:
      "Companies bury data selling and indefinite retention in dense legal text",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
];

export function ProblemSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white w-full">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-center space-y-6 mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              You're signing away your privacy,
              <br />
              <span className="text-red-400">one "I agree" at a time.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Privacy policies average 5,000+ words of impenetrable legal
              jargon. Nobody reads them. Companies know this—and they hide the
              worst clauses in plain sight.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((point, index) => (
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
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-sm"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${point.bg} ${point.color}`}
                >
                  <point.icon className="w-7 h-7" />
                </div>
                <div className={`text-3xl font-bold mb-2 ${point.color}`}>
                  {point.stat}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl border border-red-500/20 bg-red-950/10 backdrop-blur-sm"
          >
            <p className="text-lg text-center text-muted-foreground leading-relaxed">
              Most apps{" "}
              <span className="font-semibold text-foreground">
                sell your data to dozens of third parties
              </span>
              —and you never knew. By the time you realize what you agreed to,{" "}
              <span className="font-semibold text-foreground">
                it's too late
              </span>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
