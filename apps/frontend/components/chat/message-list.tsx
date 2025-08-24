"use client";

import { Box } from "@chakra-ui/react";
import type { ChatMessage } from "./message-item";
import { MessageItem } from "./message-item";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  loadingBubbleBg?: string;
  assistantBubbleBg?: string;
  userBubbleBg?: string;
}

export function MessageList({
  messages,
  isLoading = false,
  loadingBubbleBg = "white",
  assistantBubbleBg = "white",
  userBubbleBg = "blue.500"
}: MessageListProps) {
  return (
    <Box>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} bubbleBgAssistant={assistantBubbleBg} bubbleBgUser={userBubbleBg} />
      ))}
      {isLoading && (
        <Box display="flex" justifyContent="flex-start" mb={4}>
          <Box bg={loadingBubbleBg} p={4} borderRadius="lg" shadow="sm">
            <Box as="span">Thinking…</Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MessageList;
