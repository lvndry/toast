"use client";

import { Box } from "@chakra-ui/react";
import MarkdownRenderer from "../markdown/markdown-renderer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface MessageItemProps {
  message: ChatMessage;
  isCompact?: boolean;
  bubbleBgUser?: string;
  bubbleBgAssistant?: string;
  textColorUser?: string;
  textColorAssistant?: string;
}

export function MessageItem({
  message,
  isCompact = false,
  bubbleBgUser = "blue.500",
  bubbleBgAssistant = "white",
  textColorUser = "white",
  textColorAssistant = "gray.800"
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <Box
      mb={4}
      display="flex"
      justifyContent={isUser ? "flex-end" : "flex-start"}
    >
      <Box
        maxW="70%"
        bg={isUser ? bubbleBgUser : bubbleBgAssistant}
        color={isUser ? textColorUser : textColorAssistant}
        p={isCompact ? 3 : 4}
        borderRadius="lg"
        shadow="sm"
      >
        <MarkdownRenderer>{message.content}</MarkdownRenderer>
      </Box>
    </Box>
  );
}

export default MessageItem;
