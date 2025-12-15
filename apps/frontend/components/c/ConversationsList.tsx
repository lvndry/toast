"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface ConversationCard {
  id: string;
  title?: string | null;
  company_name: string;
  updated_at: string;
  last_message_at?: string | null;
  message_count?: number;
  messages?: { id: string }[];
  pinned?: boolean;
  archived?: boolean;
}

interface ConversationsListProps {
  companyName: string;
  conversations: ConversationCard[];
  onOpenConversation: (id: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onRename: (id: string, newName: string) => void;
  onTogglePinned: (id: string, newVal: boolean) => void;
  onToggleArchived: (id: string, newVal: boolean) => void;
  onDelete: (id: string) => void;
  isRefreshing?: boolean;
}

export default function ConversationsList({
  companyName,
  conversations,
  onOpenConversation,
  onRefresh,
  onCreate,
  onRename,
  onTogglePinned,
  onToggleArchived,
  onDelete,
  isRefreshing,
}: ConversationsListProps) {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Conversations</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Refresh
            </Button>
            <Button size="sm" onClick={onCreate}>
              Ask questions to {companyName} documents
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {conversations.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm line-clamp-1">
                      {c.title || c.company_name}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={c.pinned ? "default" : "outline"}
                        onClick={() => onTogglePinned(c.id, !c.pinned)}
                        className="h-7 text-xs px-2"
                      >
                        {c.pinned ? "Unpin" : "Pin"}
                      </Button>
                      <Button
                        size="sm"
                        variant={c.archived ? "default" : "outline"}
                        onClick={() => onToggleArchived(c.id, !c.archived)}
                        className="h-7 text-xs px-2"
                      >
                        {c.archived ? "Unarchive" : "Archive"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpenConversation(c.id)}
                      className="flex-1"
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const newName = window.prompt(
                          "Rename conversation",
                          c.title || "",
                        );
                        if (newName !== null) onRename(c.id, newName);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(c.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Date(
                      c.last_message_at || c.updated_at,
                    ).toLocaleString()}{" "}
                    • {c.message_count || c.messages?.length || 0} messages
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {conversations.length === 0 && !isRefreshing && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-6 text-center flex flex-col items-center gap-3">
                  <h3 className="font-semibold text-sm">
                    No conversations yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first conversation for {companyName}
                  </p>
                  <Button size="sm" onClick={onCreate}>
                    Ask questions to {companyName} documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
