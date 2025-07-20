"use client";

import {
  Badge,
  Button,
  Heading,
  Icon,
  Text
} from "@once-ui-system/core";
import { motion } from "motion/react";
import { use, useEffect, useState } from "react";
import { ChatContainer } from "../../../../components/ChatContainer";
import { ChatInput } from "../../../../components/ChatInput";

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
        content: data.answer || "Sorry, I couldn't process your request.",
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
      <div className="w-full min-h-screen flex justify-center items-center">
        <div className="max-w-xl px-8">
          <div className="flex flex-col gap-6 items-center">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Loading Animation */}
      {loading && !companyMeta && (
        <div className="w-full flex justify-center items-center bg-gray-50">
          <div className="flex flex-col items-center gap-6">
            {/* Spinning Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <Icon name="loading" size="l" onBackground="neutral-strong" />
            </motion.div>

            {/* Text */}
            <div className="text-center">
              <Heading variant="heading-strong-l">Loading...</Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" className="mt-2">
                Preparing your conversation
              </Text>
            </div>

            {/* Simple Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  className="w-3 h-3 bg-blue-500 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {companyMeta && (
        <>
          {/* Company Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Heading variant="heading-strong-l">{companyMeta.name}</Heading>
              {companyMeta.industry && (
                <Badge
                  textVariant="label-default-s"
                  onBackground="neutral-medium"
                  border="neutral-alpha-medium"
                >
                  {companyMeta.industry}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {companyMeta.website && (
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
              <Button
                size="s"
                variant="secondary"
                prefixIcon="arrowLeft"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
            </div>
          </div>

          {/* Chat Container - Scrollable content */}
          <div className="max-w-4xl mx-auto w-full p-4 pb-32">
            <ChatContainer
              messages={messages}
              loading={loading}
            />
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="opacity-100 border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0 z-10">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Ask me anything about this company..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
