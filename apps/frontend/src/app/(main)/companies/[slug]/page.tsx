"use client";

import {
  Badge,
  Button,
  Heading,
  Text
} from "@once-ui-system/core";
import { use, useEffect, useState } from "react";
import { ChatContainer } from "../../../../components/ChatContainer";
import { ChatInput } from "../../../../components/ChatInput";
import { Company, Message, MetaSummary } from "../../../../lib/types";

export default function CompanyChatPage({ params }: { params: Promise<{ slug: string; }>; }) {
  const { slug } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [metaSummary, setMetaSummary] = useState<MetaSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyData() {
      try {
        setLoading(true);

        // Fetch company data
        const companyResponse = await fetch(`/api/companies/${slug}`);
        if (!companyResponse.ok) {
          throw new Error(`Failed to fetch company: ${companyResponse.status}`);
        }
        const companyData = await companyResponse.json();
        setCompany(companyData);

        // Fetch meta summary
        const metaResponse = await fetch(`/api/meta-summary/${slug}`);
        if (metaResponse.ok) {
          const metaData = await metaResponse.json();
          setMetaSummary(metaData);

          // Set initial message with key points
          setMessages([
            {
              id: "meta-summary",
              content: metaData.keypoints.join('\n• '),
              role: "assistant",
              timestamp: new Date()
            }
          ]);
        } else {
          // If meta summary doesn't exist, set a default message
          setMessages([
            {
              id: "welcome",
              content: `Welcome to ${companyData.name}! Ask me anything about their privacy practices and data handling.`,
              role: "assistant",
              timestamp: new Date()
            }
          ]);
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch company information");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyData();
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
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heading variant="heading-strong-l" className="text-red-600 mb-4">
            Error
          </Heading>
          <Text variant="body-default-l" className="text-gray-600 mb-4">
            {error}
          </Text>
          <Button
            size="m"
            variant="primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Text variant="body-default-l">Loading company information...</Text>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heading variant="heading-strong-l" className="text-red-600 mb-4">
            Company Not Found
          </Heading>
          <Text variant="body-default-l" className="text-gray-600 mb-4">
            The company you're looking for doesn't exist.
          </Text>
          <Button
            size="m"
            variant="primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-4">
          <Heading variant="heading-strong-l">{company.name}</Heading>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Meta Summary Display */}
        {metaSummary && (
          <div className="p-3 border-b bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <Heading variant="heading-strong-m">Privacy Analysis</Heading>
                <div className="flex gap-2">
                  {Object.entries(metaSummary.scores).map(([key, score]) => (
                    <Badge
                      key={key}
                      textVariant="label-default-s"
                      onBackground="neutral-medium"
                      border="neutral-alpha-medium"
                    >
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {score.score}/10
                    </Badge>
                  ))}
                </div>
              </div>

              <Text variant="body-default-l" className="mb-4">
                {metaSummary.summary}
              </Text>

              <div>
                <Heading variant="heading-strong-s" className="mb-2">Key Points</Heading>
                <ul className="list-disc list-inside space-y-1">
                  {metaSummary.keypoints.map((point, index) => (
                    <li key={index} className="text-sm">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="p-3">
          <ChatContainer messages={messages} />
        </div>
      </div>

      {/* Fixed Chat Input */}
      <div className="border-t bg-white">
        <ChatInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={loading}
          placeholder="Ask about privacy practices, data collection, user rights..."
        />
      </div>
    </div>
  );
}
