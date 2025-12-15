"use client";

import type { ChatMessage } from "./message-item";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Thinking…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;
