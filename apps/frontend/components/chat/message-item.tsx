"use client";

import { cn } from "@/lib/utils";

import MarkdownRenderer from "../markdown/markdown-renderer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("mb-4 flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] px-4 py-3 rounded-lg shadow-sm flex flex-col items-start justify-center min-h-fit",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100",
        )}
      >
        <div
          className={cn(
            "prose prose-sm max-w-none",
            isUser ? "prose-invert" : "dark:prose-invert",
          )}
        >
          <MarkdownRenderer>{message.content}</MarkdownRenderer>
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
