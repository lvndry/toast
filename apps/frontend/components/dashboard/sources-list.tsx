"use client";

import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderOpen,
  Link as LinkIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useState } from "react";

import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
      <Card variant="elevated">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No Source Documents</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            No source documents are available for analysis yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        {/* Gradient accent */}
        <div className="h-1 w-full bg-linear-to-r from-violet-500 via-indigo-500 to-violet-500" />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Source Documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Legal documents analyzed for this company
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <FileText className="h-3 w-3" />
              {documents.length} documents
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {documents.map((doc, index) => {
            const isExpanded = expandedDocs.has(doc.id);
            const verdictConfig = doc.verdict
              ? getVerdictConfig(doc.verdict)
              : null;
            const hasSummary =
              doc.summary || (doc.keypoints && doc.keypoints.length > 0);

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group rounded-xl border overflow-hidden transition-all duration-300",
                  isExpanded
                    ? "border-violet-500/30 shadow-md bg-linear-to-r from-violet-500/5 to-transparent"
                    : "border-border/50 hover:border-violet-500/20 bg-card/50 hover:bg-card",
                )}
              >
                {/* Document Header */}
                <div
                  className={cn(
                    "p-4 cursor-pointer",
                    hasSummary && "cursor-pointer",
                  )}
                  onClick={() => hasSummary && toggleExpanded(doc.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        isExpanded
                          ? "bg-violet-500/20"
                          : "bg-muted/50 group-hover:bg-violet-500/10",
                      )}
                    >
                      <FileText
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isExpanded
                            ? "text-violet-600 dark:text-violet-400"
                            : "text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400",
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <h4
                            className={cn(
                              "font-semibold text-sm mb-1 transition-colors",
                              isExpanded
                                ? "text-violet-600 dark:text-violet-400"
                                : "group-hover:text-violet-600 dark:group-hover:text-violet-400",
                            )}
                          >
                            {doc.title || "Untitled Document"}
                          </h4>

                          {/* URL */}
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                          >
                            <LinkIcon className="h-3 w-3" />
                            <span className="truncate max-w-[200px] sm:max-w-md">
                              {doc.url}
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            {doc.doc_type && (
                              <Badge variant="outline" size="sm">
                                {doc.doc_type.replace(/_/g, " ")}
                              </Badge>
                            )}
                            {verdictConfig && (
                              <Badge
                                variant={verdictConfig.variant || "outline"}
                                size="sm"
                              >
                                {verdictConfig.label}
                              </Badge>
                            )}
                            {doc.risk_score !== null &&
                              doc.risk_score !== undefined && (
                                <Badge
                                  variant={
                                    doc.risk_score >= 7
                                      ? "danger"
                                      : doc.risk_score >= 4
                                        ? "warning"
                                        : "success"
                                  }
                                  size="sm"
                                >
                                  Risk: {doc.risk_score}/10
                                </Badge>
                              )}
                          </div>
                        </div>

                        {/* Expand button */}
                        {hasSummary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(doc.id);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
                              isExpanded
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                Close
                              </>
                            ) : (
                              <>
                                <ChevronRight className="h-3.5 w-3.5" />
                                Details
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && hasSummary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-violet-500/10">
                        <div className="space-y-4">
                          {/* Summary */}
                          {doc.summary && (
                            <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2">
                              <MarkdownRenderer>{doc.summary}</MarkdownRenderer>
                            </div>
                          )}

                          {/* Keypoints */}
                          {doc.keypoints && doc.keypoints.length > 0 && (
                            <div className="pt-2">
                              <h5 className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="h-px w-4 bg-violet-500/30" />
                                Key Insights
                              </h5>
                              <div className="grid gap-2">
                                {doc.keypoints.map(
                                  (point: string, idx: number) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ x: -10, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-violet-500/20 transition-colors"
                                    >
                                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                                      <span className="text-sm text-foreground/80 leading-relaxed">
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
