"use client";

import {
  AlertTriangle,
  CheckCircle,
  Shield,
  Sparkles,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface YourPowerProps {
  rights?: string[] | null;
  dangers?: string[] | null;
  benefits?: string[] | null;
}

export function YourPower({ rights, dangers, benefits }: YourPowerProps) {
  const hasRights = rights && rights.length > 0;
  const hasDangers = dangers && dangers.length > 0;
  const hasBenefits = benefits && benefits.length > 0;

  if (!hasRights && !hasDangers && !hasBenefits) {
    return null;
  }

  const positiveItems = [
    ...(rights?.slice(0, 3).map((r) => ({ type: "right", text: r })) || []),
    ...(benefits?.slice(0, 2).map((b) => ({ type: "benefit", text: b })) || []),
  ];

  const negativeItems = dangers?.slice(0, 5) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        {/* Gradient accent */}
        <div className="h-1 w-full bg-linear-to-r from-emerald-500 via-cyan-500 to-emerald-500" />

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Power</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Rights, benefits, and concerns to be aware of
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Positive Column - Rights & Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Your Rights & Benefits
                </h4>
              </div>

              <div className="space-y-2">
                {positiveItems.length > 0 ? (
                  positiveItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className={cn(
                        "group flex items-start gap-3 p-3.5 rounded-xl",
                        "border transition-all duration-300",
                        item.type === "right"
                          ? "bg-linear-to-r from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40"
                          : "bg-linear-to-r from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          item.type === "right"
                            ? "bg-emerald-500/20"
                            : "bg-blue-500/20",
                        )}
                      >
                        {item.type === "right" ? (
                          <CheckCircle
                            className={cn(
                              "h-3.5 w-3.5",
                              item.type === "right"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-blue-600 dark:text-blue-400",
                            )}
                          />
                        ) : (
                          <ThumbsUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <span className="text-sm text-foreground/90 leading-relaxed">
                        {item.text}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-8 rounded-xl bg-muted/30 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">
                      No specific rights documented
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Negative Column - Concerns */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                  Limitations & Concerns
                </h4>
              </div>

              <div className="space-y-2">
                {negativeItems.length > 0 ? (
                  negativeItems.map((danger, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className={cn(
                        "group flex items-start gap-3 p-3.5 rounded-xl",
                        "bg-linear-to-r from-amber-500/10 to-transparent",
                        "border border-amber-500/20 hover:border-amber-500/40",
                        "transition-all duration-300",
                      )}
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm text-foreground/90 leading-relaxed">
                        {danger}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-8 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                      <p className="text-sm font-medium">
                        No major concerns identified
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
