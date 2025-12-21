import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";

import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVerdictConfig } from "@/lib/verdict";

interface DocumentSummary {
  id: string;
  title: string | null;
  url: string;
  doc_type?: string;
  last_updated?: string | null;
  verdict?: string | null;
  risk_score?: number | null;
  summary?: string;
  keypoints?: string[];
}

interface SourcesListProps {
  documents: DocumentSummary[];
}

export function SourcesList({ documents }: SourcesListProps) {
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  function toggleExpanded(docId: string) {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedDocs(newExpanded);
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No source documents available for this company.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/10 bg-accent/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-secondary" />
          Source Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => {
            const isExpanded = expandedDocs.has(doc.id);
            const verdictConfig = doc.verdict
              ? getVerdictConfig(doc.verdict)
              : null;
            const hasSummary =
              doc.summary || (doc.keypoints && doc.keypoints.length > 0);

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group rounded-xl border bg-card/50 transition-all duration-300 ${
                  isExpanded
                    ? "border-accent/30 shadow-md"
                    : "hover:border-accent/20 hover:bg-card/80"
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => hasSummary && toggleExpanded(doc.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                      <FileText className="h-5 w-5 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">
                            {doc.title || "Untitled Document"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span className="truncate max-w-[200px] sm:max-w-md">
                              {doc.url}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {doc.doc_type && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-muted-foreground/10">
                                {doc.doc_type.replace(/_/g, " ")}
                              </span>
                            )}
                            {verdictConfig && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${verdictConfig.cardBg} ${verdictConfig.cardColor} border border-current/10`}
                              >
                                {verdictConfig.label}
                              </span>
                            )}
                            {doc.risk_score !== null && (
                              <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full border border-muted-foreground/10">
                                Risk Index: {doc.risk_score}/10
                              </span>
                            )}
                          </div>
                        </div>
                        {hasSummary && (
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(doc.id);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                isExpanded
                                  ? "bg-accent/10 text-accent"
                                  : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                              }`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                              <span>{isExpanded ? "Close" : "Summary"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && hasSummary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-accent/10 bg-accent/5 rounded-b-xl">
                        <div className="space-y-4">
                          {doc.summary && (
                            <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2">
                              <MarkdownRenderer>{doc.summary}</MarkdownRenderer>
                            </div>
                          )}

                          {doc.keypoints && doc.keypoints.length > 0 && (
                            <div className="pt-2">
                              <h5 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="h-px w-4 bg-accent/30" />
                                Critical Insights
                              </h5>
                              <div className="grid gap-2">
                                {doc.keypoints.map(
                                  (point: string, index: number) => (
                                    <motion.div
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: index * 0.05 }}
                                      key={index}
                                      className="flex items-start gap-3 p-2 rounded-lg bg-card/30 border border-accent/5 group/point hover:border-accent/20 transition-colors"
                                    >
                                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary shrink-0 group-hover/point:scale-125 transition-transform" />
                                      <span className="text-sm text-foreground/80 leading-snug">
                                        {point}
                                      </span>
                                    </motion.div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
