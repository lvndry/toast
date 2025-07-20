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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`max-w-[80%] rounded-2xl p-4 ${role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                    }`}
            >
                <div className={`prose ${role === "user" ? "prose-invert" : "prose-gray"
                    } max-w-none`}>
                    <ReactMarkdown
                        components={{
                            p: ({ children }) => <Text variant="body-default-m">{children}</Text>,
                            h1: ({ children }) => <Heading variant="heading-strong-l">{children}</Heading>,
                            h2: ({ children }) => <Heading variant="heading-strong-m">{children}</Heading>,
                            h3: ({ children }) => <Heading variant="heading-strong-s">{children}</Heading>,
                            code: ({ children }) => (
                                <code className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">
                                    {children}
                                </code>
                            ),
                            pre: ({ children }) => (
                                <pre className="bg-gray-200 text-gray-800 p-4 rounded-lg overflow-x-auto">
                                    {children}
                                </pre>
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
