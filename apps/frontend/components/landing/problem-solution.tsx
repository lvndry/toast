"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
              <X className="mr-2 h-4 w-4" /> The Problem
            </div>
            <h3 className="text-3xl font-bold tracking-tight">
              You're signing away your privacy
            </h3>
            <p className="text-muted-foreground text-lg">
              Privacy policies average 5,000+ words of legal jargon designed to
              hide the truth. Companies bury data selling clauses, vague
              retention periods, and one-sided liability in dense paragraphs
              you'll never read.
            </p>
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 dark:border-red-900/20 dark:bg-red-900/10">
              <div className="space-y-3 text-sm text-red-900/70 dark:text-red-200/70">
                <p className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Average person would need <strong>76 workdays</strong> to
                    read all privacy policies they encounter yearly
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>86% of people</strong> never read privacy policies
                    before accepting
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Most apps <strong>sell your data</strong> to dozens of third
                    parties—and you never knew
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-900 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-200">
              <Check className="mr-2 h-4 w-4" /> The Solution
            </div>
            <h3 className="text-3xl font-bold tracking-tight">
              Toast AI reads it for you
            </h3>
            <p className="text-muted-foreground text-lg">
              Our AI analyzes privacy policies in seconds, extracting the
              critical information you actually need. Get a clear verdict, risk
              score, and plain-English summary of what matters.
            </p>
            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6 dark:border-green-900/20 dark:bg-green-900/10 shadow-lg">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 dark:bg-green-900/30 dark:text-green-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="font-medium">
                    <strong>Know in 60 seconds</strong> what they're doing with
                    your data
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 dark:bg-green-900/30 dark:text-green-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="font-medium">
                    <strong>See the risky clauses</strong> highlighted with
                    citations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 dark:bg-green-900/30 dark:text-green-400">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="font-medium">
                    <strong>Get a clear privacy analysis</strong>: very user
                    friendly, moderate, or very pervasive
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
