"use client";

import { AlertTriangle, CheckCircle, Share2, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThirdPartyRecipient {
  recipient: string;
  data_shared: string[];
  purpose?: string | null;
  risk_level: "low" | "medium" | "high";
}

interface SharingMapProps {
  thirdPartyDetails?: ThirdPartyRecipient[] | null;
  // Fallback to simple string
  thirdPartySharing?: string | null;
}

const riskConfig = {
  low: {
    color: "text-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: Shield,
    label: "Low Risk",
  },
  medium: {
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: CheckCircle,
    label: "Medium Risk",
  },
  high: {
    color: "text-red-600",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: AlertTriangle,
    label: "High Risk",
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

  // Count by risk level
  const highRiskCount =
    thirdPartyDetails?.filter((t) => t.risk_level === "high").length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Who Has Your Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Third parties that receive your data
        </p>
      </CardHeader>
      <CardContent>
        {hasStructuredData ? (
          <div className="space-y-3">
            {thirdPartyDetails.map((recipient, index) => {
              const config = riskConfig[recipient.risk_level];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${config.border} ${config.bg}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                      <div>
                        <h4 className="font-semibold text-sm">
                          {recipient.recipient}
                        </h4>
                        {recipient.purpose && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {recipient.purpose}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {recipient.data_shared.map((data, dIndex) => (
                            <Badge
                              key={dIndex}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {data}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${config.color} ${config.bg} border-0 text-xs`}
                    >
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Fallback: show simple text
          <p className="text-sm text-foreground/80">{thirdPartySharing}</p>
        )}

        {/* Summary */}
        {hasStructuredData && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Shared with{" "}
              {thirdPartyDetails.length <= 3
                ? thirdPartyDetails.map((t) => t.recipient).join(", ")
                : `${thirdPartyDetails
                    .slice(0, 2)
                    .map((t) => t.recipient)
                    .join(", ")} and ${thirdPartyDetails.length - 2} others`}
            </span>
            {highRiskCount > 0 && (
              <span className="text-red-500 font-medium">
                {highRiskCount} high-risk
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
