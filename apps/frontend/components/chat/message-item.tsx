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
  bubbleBgUser?: string;
  bubbleBgAssistant?: string;
  textColorUser?: string;
  textColorAssistant?: string;
}

export function MessageItem({
  message,
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
        p={{ px: 3, py: 2 }}
        borderRadius="lg"
        shadow="sm"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="center"
        minH="fit-content"
      >
        <MarkdownRenderer>{message.content}</MarkdownRenderer>
      </Box>
    </Box>
  );
}

export default MessageItem;
