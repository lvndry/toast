"use client";

import {
  Badge,
  Button,
  Card,
  Column,
  Heading,
  Icon,
  Input,
  Row,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import { use, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface CompanyMetaSummary {
  id: string;
  name: string;
  summary: string;
  industry?: string;
  website?: string;
}

export default function CompanyChatPage({ params }: { params: Promise<{ slug: string; }>; }) {
  const { slug } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyMeta, setCompanyMeta] = useState<CompanyMetaSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchCompanyMeta() {
      try {
        setLoading(true);
        const response = await fetch(`/api/meta-summary/${slug}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch company meta: ${response.status}`);
        }

        const data = await response.json();
        setCompanyMeta(data);

        // Add the meta summary as the first assistant message
        setMessages([
          {
            id: "meta-summary",
            content: data.summary,
            role: "assistant",
            timestamp: new Date()
          }
        ]);
      } catch (err) {
        console.error("Error fetching company meta:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch company information");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyMeta();
  }, [slug]);

  async function handleSendMessage() {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/q", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputValue,
          company_slug: slug
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.message || "Sorry, I couldn't process your request.",
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  if (error) {
    return (
      <Column fillWidth className="min-h-screen" horizontal="center" align="center">
        <Column maxWidth="xl" padding="xl" horizontal="center">
          <Column gap="l" horizontal="center" align="center">
            <Icon name="alert" size="xl" onBackground="brand-strong" />
            <Heading variant="heading-strong-l">Error Loading Company</Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {error}
            </Text>
            <Button
              size="m"
              weight="strong"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Column>
        </Column>
      </Column>
    );
  }

  return (
    <Column fillWidth className="h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Header */}
      <Column maxWidth="xl" padding="l" horizontal="center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <Card padding="l" radius="l" className="bg-white border border-gray-100 shadow-sm">
            <Row horizontal="space-between" align="center">
              <Column gap="s">
                <Heading variant="heading-strong-l">
                  {companyMeta?.name || "Loading..."}
                </Heading>
                <Row gap="m" wrap>
                  {companyMeta?.industry && (
                    <Badge
                      textVariant="label-default-s"
                      onBackground="neutral-medium"
                      border="neutral-alpha-medium"
                      className="bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {companyMeta.industry}
                    </Badge>
                  )}
                  {companyMeta?.website && (
                    <Button
                      size="s"
                      variant="secondary"
                      prefixIcon="external-link"
                      href={companyMeta.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Website
                    </Button>
                  )}
                </Row>
              </Column>
              <Button
                size="s"
                variant="secondary"
                prefixIcon="arrow-left"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
            </Row>
          </Card>
        </motion.div>
      </Column>

      {/* Chat Messages */}
      <Column
        fillWidth
        className="flex-1 overflow-hidden"
        maxWidth="xl"
        horizontal="center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full h-full flex flex-col"
        >
          <Card
            padding="l"
            radius="l"
            className="bg-white border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden"
          >
            {/* Messages Container */}
            <Column
              className="flex-1 overflow-y-auto space-y-4 mb-4"
              gap="m"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                      }`}
                  >
                    <div className={`prose ${message.role === "user" ? "prose-invert" : "prose-gray"
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
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-900 rounded-2xl p-4">
                    <Row gap="s" align="center">
                      <Icon name="loading" size="s" onBackground="neutral-weak" className="animate-spin" />
                      <Text variant="body-default-m">Thinking...</Text>
                    </Row>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </Column>

            {/* Input Section */}
            <Row gap="s" align="end">
              <Input
                id="chat-input"
                type="text"
                placeholder="Ask about this company..."
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={loading}
              />
              <Button
                size="m"
                weight="strong"
                prefixIcon="send"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
              >
                Send
              </Button>
            </Row>
          </Card>
        </motion.div>
      </Column>
    </Column>
  );
}
