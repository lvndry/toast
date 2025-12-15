"use client";

import { ArrowLeft, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ConversationMeta {
  id: string;
  pinned?: boolean;
  archived?: boolean;
}

interface QHeaderProps {
  title: string;
  subtitle?: string;
  conversation?: ConversationMeta | null;
  onBack: () => void;
  onUploadClick?: () => void;
  onDeleteClick?: () => void;
  onTogglePinned?: () => void;
  onToggleArchived?: () => void;
  uploadLoading?: boolean;
  onToggleSummarySidebar?: () => void;
  isSummarySidebarOpen?: boolean;
}

export default function QHeader({
  title,
  subtitle,
  conversation,
  onBack,
  onUploadClick,
  onDeleteClick,
  onTogglePinned,
  onToggleArchived,
  uploadLoading,
  onToggleSummarySidebar,
  isSummarySidebarOpen,
}: QHeaderProps) {
  return (
    <div className="bg-background shadow-sm border-b border-border shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
            {conversation && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={conversation.pinned ? "default" : "outline"}
                  onClick={onTogglePinned}
                  className="h-7 text-xs"
                >
                  {conversation.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  size="sm"
                  variant={conversation.archived ? "default" : "outline"}
                  onClick={onToggleArchived}
                  className="h-7 text-xs"
                >
                  {conversation.archived ? "Unarchive" : "Archive"}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {conversation && onToggleSummarySidebar && (
              <Button
                size="sm"
                variant={isSummarySidebarOpen ? "default" : "outline"}
                onClick={onToggleSummarySidebar}
              >
                {isSummarySidebarOpen ? "Hide Summary" : "Show Summary"}
              </Button>
            )}
            {conversation && onUploadClick && (
              <Button
                size="sm"
                variant="outline"
                onClick={onUploadClick}
                disabled={uploadLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadLoading ? "Uploading..." : "Upload More Documents"}
              </Button>
            )}
            {conversation && onDeleteClick && (
              <Button size="sm" variant="destructive" onClick={onDeleteClick}>
                Delete
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
