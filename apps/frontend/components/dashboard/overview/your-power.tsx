"use client";

import { AlertTriangle, CheckCircle, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Your Power
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What you can do about your data
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* What you CAN do */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              What You Can Do
            </h4>
            <div className="space-y-2">
              {hasRights &&
                rights.slice(0, 4).map((right, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{right}</span>
                  </div>
                ))}
              {hasBenefits &&
                benefits.slice(0, 2).map((benefit, index) => (
                  <div
                    key={`benefit-${index}`}
                    className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900"
                  >
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* What you CANNOT do / Limitations */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Limitations & Concerns
            </h4>
            <div className="space-y-2">
              {hasDangers &&
                dangers.slice(0, 5).map((danger, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{danger}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
