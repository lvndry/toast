"use client";

import { ArrowRight, Database, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPurposeLink {
  data_type: string;
  purposes: string[];
}

interface DataStoryProps {
  dataCollectionDetails?: DataPurposeLink[] | null;
  // Fallback to flat lists if structured data not available
  dataCollected?: string[] | null;
  dataPurposes?: string[] | null;
}

export function DataStory({
  dataCollectionDetails,
  dataCollected,
  dataPurposes,
}: DataStoryProps) {
  // Use structured data if available, otherwise show simple list
  const hasStructuredData =
    dataCollectionDetails && dataCollectionDetails.length > 0;
  const hasFallbackData =
    (dataCollected && dataCollected.length > 0) ||
    (dataPurposes && dataPurposes.length > 0);

  if (!hasStructuredData && !hasFallbackData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Your Data Story
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What data is collected and why
        </p>
      </CardHeader>
      <CardContent>
        {hasStructuredData ? (
          <div className="space-y-3">
            {dataCollectionDetails.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Database className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm">{item.data_type}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {item.purposes.map((purpose, pIndex) => (
                    <span
                      key={pIndex}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      <Target className="h-3 w-3" />
                      {purpose}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Fallback: show flat lists
          <div className="space-y-4">
            {dataCollected && dataCollected.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Collected
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dataCollected.map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md bg-muted text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dataPurposes && dataPurposes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Used For
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dataPurposes.map((purpose, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                    >
                      {purpose}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          {hasStructuredData
            ? `${dataCollectionDetails.length} data types collected`
            : dataCollected
              ? `${dataCollected.length} data types collected`
              : null}
        </div>
      </CardContent>
    </Card>
  );
}
