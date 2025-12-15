import { ExternalLink, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentSummary {
  id: string;
  title: string | null;
  url: string;
  doc_type?: string;
  last_updated?: string | null;
  verdict?: string | null;
  risk_score?: number | null;
}

interface SourcesListProps {
  documents: DocumentSummary[];
}

export function SourcesList({ documents }: SourcesListProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Source Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-lg border p-4 transition-all hover:bg-muted/50 hover:border-primary/30 group"
            >
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                  {doc.title || "Untitled Document"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{doc.url}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {doc.doc_type && (
                  <div className="mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {doc.doc_type.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
