"use client";

import { ArrowRight, Database, Layers, Target } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataPurposeLink {
  data_type: string;
  purposes: string[];
}

interface DataStoryProps {
  dataCollectionDetails?: DataPurposeLink[] | null;
  dataCollected?: string[] | null;
  dataPurposes?: string[] | null;
}

export function DataStory({
  dataCollectionDetails,
  dataCollected,
  dataPurposes,
}: DataStoryProps) {
  const hasStructuredData =
    dataCollectionDetails && dataCollectionDetails.length > 0;
  const hasFallbackData =
    (dataCollected && dataCollected.length > 0) ||
    (dataPurposes && dataPurposes.length > 0);

  if (!hasStructuredData && !hasFallbackData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        {/* linear accent */}
        <div className="h-1 w-full bg-linear-to-r from-blue-500 via-purple-500 to-blue-500" />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Your Data Story</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  What data is collected and why
                </p>
              </div>
            </div>
            {hasStructuredData && (
              <Badge variant="outline" className="gap-1.5">
                <Layers className="h-3 w-3" />
                {dataCollectionDetails.length} types
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {hasStructuredData ? (
            <div className="space-y-3">
              {dataCollectionDetails.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={cn(
                    "group relative flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl",
                    "bg-linear-to-r from-muted/50 to-transparent",
                    "border border-border/50 hover:border-blue-500/30",
                    "transition-all duration-300",
                  )}
                >
                  {/* Data type */}
                  <div className="flex items-center gap-2.5 sm:min-w-[160px]">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-sm text-foreground">
                      {item.data_type}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0 hidden sm:block mt-2" />

                  {/* Purposes */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {item.purposes.map((purpose, pIndex) => (
                      <Badge
                        key={pIndex}
                        variant="secondary"
                        size="sm"
                        className="gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0"
                      >
                        <Target className="h-3 w-3" />
                        {purpose}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {dataCollected && dataCollected.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Database className="h-3.5 w-3.5" />
                    Data Collected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dataCollected.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Badge variant="outline" className="rounded-lg">
                          {item}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {dataPurposes && dataPurposes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" />
                    Used For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dataPurposes.map((purpose, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0"
                        >
                          {purpose}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer stats */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {hasStructuredData
                ? `${dataCollectionDetails.length} data types collected for ${dataCollectionDetails.reduce((acc, d) => acc + d.purposes.length, 0)} purposes`
                : dataCollected
                  ? `${dataCollected.length} data types identified`
                  : null}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
