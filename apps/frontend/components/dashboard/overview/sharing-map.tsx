"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Network,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ThirdPartyRecipient {
  recipient: string;
  data_shared: string[];
  purpose?: string | null;
  risk_level: "low" | "medium" | "high";
}

interface SharingMapProps {
  thirdPartyDetails?: ThirdPartyRecipient[] | null;
  thirdPartySharing?: string | null;
}

const riskConfig = {
  low: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    bgGradient: "from-green-500/10 via-green-500/5 to-transparent",
    border: "border-green-500/20",
    icon: Shield,
    label: "Low",
    badgeVariant: "success" as const,
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    border: "border-amber-500/20",
    icon: CheckCircle,
    label: "Medium",
    badgeVariant: "warning" as const,
  },
  high: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    bgGradient: "from-red-500/10 via-red-500/5 to-transparent",
    border: "border-red-500/20",
    icon: AlertTriangle,
    label: "High Risk",
    badgeVariant: "danger" as const,
  },
};

export function SharingMap({
  thirdPartyDetails,
  thirdPartySharing,
}: SharingMapProps) {
  const hasStructuredData = thirdPartyDetails && thirdPartyDetails.length > 0;
  const hasFallback = thirdPartySharing && thirdPartySharing.length > 0;

  if (!hasStructuredData && !hasFallback) {
    return null;
  }

  const highRiskCount =
    thirdPartyDetails?.filter((t) => t.risk_level === "high").length || 0;
  const mediumRiskCount =
    thirdPartyDetails?.filter((t) => t.risk_level === "medium").length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        {/* Gradient accent */}
        <div className="h-1 w-full bg-linear-to-r from-orange-500 via-pink-500 to-orange-500" />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
                <Network className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Who Has Your Data</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Third parties that receive your data
                </p>
              </div>
            </div>

            {hasStructuredData && (
              <div className="flex items-center gap-2">
                {highRiskCount > 0 && (
                  <Badge variant="danger" size="sm" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {highRiskCount} high
                  </Badge>
                )}
                <Badge variant="outline" size="sm" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {thirdPartyDetails.length} parties
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {hasStructuredData ? (
            <div className="space-y-3">
              {thirdPartyDetails.map((recipient, index) => {
                const config = riskConfig[recipient.risk_level];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={cn(
                      "relative p-4 rounded-xl border overflow-hidden",
                      "transition-all duration-300 hover:shadow-md",
                      config.border,
                    )}
                  >
                    {/* Background gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-linear-to-r",
                        config.bgGradient,
                      )}
                    />

                    {/* Content */}
                    <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Recipient info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            config.bg,
                          )}
                        >
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground truncate">
                              {recipient.recipient}
                            </h4>
                            <Badge
                              variant={config.badgeVariant}
                              size="sm"
                              className="shrink-0"
                            >
                              {config.label}
                            </Badge>
                          </div>

                          {recipient.purpose && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {recipient.purpose}
                            </p>
                          )}

                          {/* Shared data badges */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {recipient.data_shared.map((data, dIndex) => (
                              <Badge
                                key={dIndex}
                                variant="outline"
                                size="sm"
                                className="bg-background/50"
                              >
                                {data}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-foreground/80 leading-relaxed">
              {thirdPartySharing}
            </p>
          )}

          {/* Summary footer */}
          {hasStructuredData && (
            <div className="pt-4 border-t border-border/50">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Data shared with{" "}
                  <span className="font-medium text-foreground">
                    {thirdPartyDetails.length} third parties
                  </span>
                </span>

                <div className="flex items-center gap-3 ml-auto">
                  {highRiskCount > 0 && (
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {highRiskCount} high-risk
                    </span>
                  )}
                  {mediumRiskCount > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {mediumRiskCount} medium
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
