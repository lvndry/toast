"use client";

import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface VerdictHeroProps {
  companyName: string;
  verdict:
    | "very_user_friendly"
    | "user_friendly"
    | "moderate"
    | "pervasive"
    | "very_pervasive";
  riskScore: number;
  summary: string;
  keypoints?: string[] | null;
}

const verdictConfig = {
  very_user_friendly: {
    label: "Very User Friendly",
    shortLabel: "Excellent",
    description: "This service respects your privacy",
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-500/30",
    iconBg: "bg-emerald-500/20",
    ringColor: "stroke-emerald-500",
    icon: ShieldCheck,
  },
  user_friendly: {
    label: "User Friendly",
    shortLabel: "Good",
    description: "Generally respects user privacy",
    color: "text-green-600 dark:text-green-400",
    bgGradient: "from-green-500/15 via-green-500/5 to-transparent",
    borderColor: "border-green-500/30",
    iconBg: "bg-green-500/20",
    ringColor: "stroke-green-500",
    icon: CheckCircle,
  },
  moderate: {
    label: "Moderate",
    shortLabel: "Moderate",
    description: "Some privacy concerns to be aware of",
    color: "text-amber-600 dark:text-amber-400",
    bgGradient: "from-amber-500/15 via-amber-500/5 to-transparent",
    borderColor: "border-amber-500/30",
    iconBg: "bg-amber-500/20",
    ringColor: "stroke-amber-500",
    icon: Shield,
  },
  pervasive: {
    label: "Pervasive",
    shortLabel: "Concerning",
    description: "Significant privacy concerns identified",
    color: "text-orange-600 dark:text-orange-400",
    bgGradient: "from-orange-500/15 via-orange-500/5 to-transparent",
    borderColor: "border-orange-500/30",
    iconBg: "bg-orange-500/20",
    ringColor: "stroke-orange-500",
    icon: ShieldAlert,
  },
  very_pervasive: {
    label: "Very Pervasive",
    shortLabel: "High Risk",
    description: "Major privacy concerns require attention",
    color: "text-red-600 dark:text-red-400",
    bgGradient: "from-red-500/15 via-red-500/5 to-transparent",
    borderColor: "border-red-500/30",
    iconBg: "bg-red-500/20",
    ringColor: "stroke-red-500",
    icon: AlertTriangle,
  },
};

function AnimatedRiskRing({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 10) * circumference;

  return (
    <div className="relative w-36 h-36">
      {/* Background ring */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          className="stroke-muted/30"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={cn(
            "text-4xl font-bold font-display",
            color.replace("stroke-", "text-"),
          )}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          / 10
        </span>
      </div>
    </div>
  );
}

export function VerdictHero({
  companyName,
  verdict,
  riskScore,
  summary,
  keypoints,
}: VerdictHeroProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;
  const topKeypoints = keypoints?.slice(0, 4) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border-2",
        config.borderColor,
      )}
    >
      {/* Gradient background */}
      <div
        className={cn("absolute inset-0 bg-linear-to-br", config.bgGradient)}
      />

      {/* Spotlight effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-linear-to-br from-white/10 to-transparent rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* Left: Verdict Info */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                  config.iconBg,
                )}
              >
                <Icon className={cn("h-7 w-7", config.color)} />
              </motion.div>

              <div className="space-y-1">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <h2
                    className={cn(
                      "text-2xl md:text-3xl font-bold font-display",
                      config.color,
                    )}
                  >
                    {config.label}
                  </h2>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground"
                >
                  {config.description}
                </motion.p>
              </div>
            </div>

            {/* Summary */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-foreground/90 leading-relaxed text-lg"
            >
              {summary}
            </motion.p>

            {/* Key insights */}
            {topKeypoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 pt-2"
              >
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-muted-foreground/30" />
                  Key Insights
                </h4>
                <div className="grid gap-2">
                  {topKeypoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5",
                          config.color,
                        )}
                      />
                      <span className="text-sm text-foreground/80 leading-relaxed">
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Risk Score Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="flex flex-col items-center gap-4 lg:pl-8"
          >
            <AnimatedRiskRing score={riskScore} color={config.ringColor} />

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Privacy Risk
              </p>
              <p className={cn("text-sm font-semibold mt-0.5", config.color)}>
                {riskScore <= 3
                  ? "Low Risk"
                  : riskScore <= 6
                    ? "Moderate Risk"
                    : "High Risk"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
