import {
  Icon,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatContainerProps {
  messages: Message[];
  loading?: boolean;
}

export function ChatContainer({ messages, loading = false }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          id={message.id}
          content={message.content}
          role={message.role}
          timestamp={message.timestamp}
        />
      ))}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="bg-gray-100 text-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Icon name="loading" size="s" onBackground="neutral-weak" className="animate-spin" />
              <Text variant="body-default-m">Thinking...</Text>
            </div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
