import {
  Heading,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatMessage({ id, content, role, timestamp }: ChatMessageProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`rounded-xl px-12 py-8 ${role === "user"
          ? "bg-neutral-900 text-white border border-neutral-800"
          : "bg-white border border-neutral-200 text-neutral-900 shadow-sm"
          }`}
      >
        <div className={`prose ${role === "user" ? "prose-invert" : "prose-neutral"
          } max-w-none prose-md`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <Text variant="body-default-s" className="mb-2 last:mb-0">{children}</Text>,
              h1: ({ children }) => <Heading variant="heading-strong-m" className="mb-3">{children}</Heading>,
              h2: ({ children }) => <Heading variant="heading-strong-s" className="mb-2">{children}</Heading>,
              h3: ({ children }) => <Heading variant="heading-strong-s" className="mb-2">{children}</Heading>,
              code: ({ children }) => (
                <code className={`${role === "user"
                  ? "bg-neutral-800 text-neutral-200"
                  : "bg-neutral-100 text-neutral-800"
                  } px-1.5 py-0.5 rounded text-xs font-mono select-text`}>
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className={`${role === "user"
                  ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                  : "bg-neutral-50 text-neutral-800 border-neutral-200"
                  } p-3 rounded-lg overflow-x-auto select-text border text-sm font-mono`}>
                  {children}
                </pre>
              ),
              ul: ({ children }) => <ul className="space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
