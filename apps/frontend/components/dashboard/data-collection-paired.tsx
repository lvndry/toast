import { Database, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataCollectionPairedProps {
  dataCollected: string[];
  purposes: string[];
}

export function DataCollectionPaired({
  dataCollected,
  purposes,
}: DataCollectionPairedProps) {
  // Show data collection in a more contextual way
  // If we have both data types and purposes, show them together
  // Otherwise, show what we have

  const hasData = dataCollected.length > 0;
  const hasPurposes = purposes.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Collection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData ? (
          <div className="space-y-3">
            {dataCollected.map((dataType, index) => (
              <div
                key={index}
                className="rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="font-semibold text-sm">{dataType}</span>
                </div>
                {hasPurposes && (
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Target className="h-3 w-3" />
                      <span className="font-medium">Collected for:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {purposes.map((purpose, pIndex) => (
                        <Badge
                          key={pIndex}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {purpose}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : hasPurposes ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Data is collected for:
            </p>
            <div className="flex flex-wrap gap-2">
              {purposes.map((purpose, index) => (
                <Badge key={index} variant="secondary">
                  {purpose}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No specific data collection details available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
