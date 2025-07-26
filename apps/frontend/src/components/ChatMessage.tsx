import {
  Heading,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatMessage({ id, content, role }: ChatMessageProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`max-w-2xl rounded-2xl px-6 py-4 shadow-sm ${role === "user"
          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border border-blue-500/20"
          : "bg-white/80 backdrop-blur-sm border border-white/20 text-gray-900"
          }`}
      >
        <div className={`prose ${role === "user" ? "prose-invert" : "prose-neutral"} max-w-none prose-md`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Text
                  variant="body-default-s"
                  className={`mb-3 last:mb-0 leading-relaxed ${role === "user" ? "text-white/90" : "text-gray-700"
                    }`}
                >
                  {children}
                </Text>
              ),
              h1: ({ children }) => (
                <Heading
                  variant="heading-strong-m"
                  className={`mb-4 ${role === "user" ? "text-white" : "text-gray-900"
                    }`}
                >
                  {children}
                </Heading>
              ),
              h2: ({ children }) => (
                <Heading
                  variant="heading-strong-s"
                  className={`mb-3 ${role === "user" ? "text-white" : "text-gray-900"
                    }`}
                >
                  {children}
                </Heading>
              ),
              h3: ({ children }) => (
                <Heading
                  variant="heading-strong-xs"
                  className={`mb-2 ${role === "user" ? "text-white" : "text-gray-900"
                    }`}
                >
                  {children}
                </Heading>
              ),
              a: ({ children, href }) =>
                href ? (
                  <Link
                    href={href}
                    className={`underline hover:no-underline transition-all ${role === "user"
                      ? "text-blue-200 hover:text-white"
                      : "text-blue-600 hover:text-blue-700"
                      }`}
                  >
                    {children}
                  </Link>
                ) : children,
              code: ({ children }) => (
                <code className={`px-2 py-1 rounded-md text-xs font-mono select-text ${role === "user"
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}>
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className={`p-4 rounded-xl overflow-x-auto select-text border text-sm font-mono my-4 ${role === "user"
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-gray-50 text-gray-800 border-gray-200"
                  }`}>
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className={`space-y-2 my-4 ${role === "user" ? "text-white/90" : "text-gray-700"
                  }`}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className={`space-y-2 my-4 ${role === "user" ? "text-white/90" : "text-gray-700"
                  }`}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className={`text-sm leading-relaxed ${role === "user" ? "text-white/90" : "text-gray-700"
                  }`}>
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className={`border-l-4 pl-4 my-4 italic ${role === "user"
                  ? "border-white/30 text-white/80"
                  : "border-gray-300 text-gray-600"
                  }`}>
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className={`font-semibold ${role === "user" ? "text-white" : "text-gray-900"
                  }`}>
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className={`italic ${role === "user" ? "text-white/90" : "text-gray-700"
                  }`}>
                  {children}
                </em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
