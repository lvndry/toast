"use client";

import {
  AlertTriangle,
  CheckCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface VerdictHeroProps {
  productName: string;
  companyName?: string | null;
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
    subtitle: "Your privacy is well protected",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/30 dark:bg-emerald-950/10",
    icon: ShieldCheck,
  },
  user_friendly: {
    label: "User Friendly",
    subtitle: "Generally respects your privacy",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50/30 dark:bg-green-950/10",
    icon: CheckCircle,
  },
  moderate: {
    label: "Moderate",
    subtitle: "Some privacy considerations",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/30 dark:bg-amber-950/10",
    icon: Shield,
  },
  pervasive: {
    label: "Pervasive",
    subtitle: "Significant privacy concerns",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50/30 dark:bg-orange-950/10",
    icon: ShieldAlert,
  },
  very_pervasive: {
    label: "Very Pervasive",
    subtitle: "Major privacy risks identified",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50/30 dark:bg-red-950/10",
    icon: AlertTriangle,
  },
};

export function VerdictHero({
  productName,
  companyName,
  verdict,
  riskScore,
  summary,
  keypoints,
}: VerdictHeroProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;
  const topKeypoints = keypoints?.slice(0, 3) || [];

  const getRiskLabel = () => {
    if (riskScore <= 3) return "Low";
    if (riskScore <= 6) return "Moderate";
    return "High";
  };

  const getRiskColor = () => {
    if (riskScore <= 3) return "text-emerald-600 dark:text-emerald-400";
    if (riskScore <= 6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-8">
      {/* Main Verdict Section */}
      <div className="space-y-5">
        {/* Verdict Header - Better aligned */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5",
              config.bg,
            )}
          >
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1
                className={cn(
                  "text-3xl md:text-4xl font-bold font-display tracking-tight",
                  config.color,
                )}
              >
                {config.label}
              </h1>
              <span className="text-lg font-medium text-muted-foreground">
                {riskScore}/10
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Summary - Readable size */}
        <div className="pl-11 px-24">
          <p className="text-base text-foreground leading-relaxed">{summary}</p>
        </div>

        {/* Risk Info - Clean, aligned */}
        <div className="flex items-center gap-6 pl-11 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Risk
            </span>
            <span className={cn("text-sm font-semibold", getRiskColor())}>
              {getRiskLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Key Insights - Clean, readable */}
      {topKeypoints.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-border/50 pl-11">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Key Insights
          </h3>
          <div className="space-y-2.5">
            {topKeypoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed"
              >
                <span
                  className={cn(
                    "mt-1.5 h-1 w-1 rounded-full shrink-0",
                    config.color.replace("text-", "bg-"),
                  )}
                />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
