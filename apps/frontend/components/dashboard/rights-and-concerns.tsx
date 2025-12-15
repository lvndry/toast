import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RightsAndConcernsProps {
  rights: string[];
  dangers: string[];
  benefits?: string[];
}

export function RightsAndConcerns({
  rights,
  dangers,
  benefits,
}: RightsAndConcernsProps) {
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
          <Shield className="h-5 w-5" />
          What You Should Know
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Your Rights */}
        {hasRights && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-500">
              <CheckCircle className="h-4 w-4" />
              Your Rights & Controls
            </h3>
            <div className="space-y-2">
              {rights.map((right, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm dark:border-green-900 dark:bg-green-950/20"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                  <span className="text-foreground">{right}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits (if available) */}
        {hasBenefits && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-500">
              <Shield className="h-4 w-4" />
              Positive Privacy Practices
            </h3>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/20"
                >
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-500" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Things to Be Aware Of */}
        {hasDangers && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              Things to Be Aware Of
            </h3>
            <div className="space-y-2">
              {dangers.map((danger, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/20"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                  <span className="text-foreground">{danger}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
