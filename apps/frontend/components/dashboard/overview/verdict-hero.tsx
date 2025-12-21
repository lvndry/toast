"use client";

import {
  AlertTriangle,
  CheckCircle,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
    color: "text-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: Shield,
  },
  user_friendly: {
    label: "User Friendly",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: CheckCircle,
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: TrendingUp,
  },
  pervasive: {
    label: "Pervasive",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: TrendingDown,
  },
  very_pervasive: {
    label: "Very Pervasive",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: AlertTriangle,
  },
};

function getRiskColor(score: number): string {
  if (score <= 2) return "text-green-500";
  if (score <= 4) return "text-green-400";
  if (score <= 6) return "text-amber-500";
  if (score <= 8) return "text-orange-500";
  return "text-red-500";
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
  const riskColor = getRiskColor(riskScore);

  // Show top 3 keypoints as quick badges
  const topKeypoints = keypoints?.slice(0, 3) || [];

  return (
    <Card className={`${config.border} border-2`}>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Verdict + Summary */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${config.color}`}>
                  {config.label}
                </h2>
                <p className="text-sm text-muted-foreground">{companyName}</p>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed">{summary}</p>

            {/* Key insights */}
            {topKeypoints.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {topKeypoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-foreground/70 leading-relaxed"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${config.color.replace("text-", "bg-")} mt-2 shrink-0`}
                      />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Risk Score */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/50 min-w-[140px]">
            <span className="text-sm text-muted-foreground font-medium mb-1">
              Risk Score
            </span>
            <span className={`text-5xl font-bold ${riskColor}`}>
              {riskScore}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
