"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import MarkdownRenderer from "../markdown/markdown-renderer";

export interface MetaSummaryData {
  summary: string;
  scores: Record<string, { score: number; justification: string }>;
  keypoints: string[];
}

interface CompanyMetaSummaryProps {
  metaSummary: MetaSummaryData;
}

export default function CompanyMetaSummary({
  metaSummary,
}: CompanyMetaSummaryProps) {
  const [showAllKeyPoints, setShowAllKeyPoints] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Scores Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Privacy Analysis Scores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metaSummary.scores).map(([key, score]) => (
              <Card key={key}>
                <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                  <span className="text-sm font-semibold text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-2xl font-bold text-blue-500">
                    {score.score}/10
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {score.justification}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Points Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Key Points</h2>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {(showAllKeyPoints
                    ? metaSummary.keypoints
                    : metaSummary.keypoints.slice(0, 5)
                  ).map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-sm text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
                {metaSummary.keypoints.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllKeyPoints(!showAllKeyPoints)}
                    className="mt-4"
                  >
                    {showAllKeyPoints
                      ? "Show Less"
                      : `Show All ${metaSummary.keypoints.length} Points`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                  <MarkdownRenderer>{metaSummary.summary}</MarkdownRenderer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
