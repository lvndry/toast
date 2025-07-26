"use client";

import {
  Button,
  Heading,
  Text
} from "@once-ui-system/core";
import { use, useEffect, useState } from "react";
import { ChatInput } from "../../../../components/ChatInput";
import { ChatMessage } from "../../../../components/ChatMessage";
import { Company, Message, MetaSummary } from "../../../../lib/types";

export default function CompanyChatPage({ params }: { params: Promise<{ slug: string; }>; }) {
  const { slug } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [metaSummary, setMetaSummary] = useState<MetaSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllKeyPoints, setShowAllKeyPoints] = useState(false);

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
        content: data.answer,
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white border-b">
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Meta Summary Display */}
        {metaSummary && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto">
              {/* Scores Section - Top */}
              <div className="mb-6">
                <Heading variant="heading-strong-m" className="mb-4">Privacy Analysis Scores</Heading>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(metaSummary.scores).map(([key, score]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border text-center">
                      <Text variant="label-default-s" className="text-gray-600 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <div className="text-2xl font-bold text-blue-600">
                        {score.score}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Layout for Key Points and Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Points Section - Left Side */}
                <div className="lg:col-span-2">
                  <Heading variant="heading-strong-s" className="mb-3">Key Points</Heading>
                  <div className="bg-white rounded-lg p-4 border">
                    <ul className="space-y-2">
                      {(showAllKeyPoints ? metaSummary.keypoints : metaSummary.keypoints.slice(0, 5)).map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <Text variant="body-default-s">{point}</Text>
                        </li>
                      ))}
                    </ul>
                    {metaSummary.keypoints.length > 5 && (
                      <Button
                        size="s"
                        variant="secondary"
                        onClick={() => setShowAllKeyPoints(!showAllKeyPoints)}
                        className="mt-3"
                      >
                        {showAllKeyPoints ? 'Show Less' : `Show All ${metaSummary.keypoints.length} Points`}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Summary Section - Right Side */}
                <div className="lg:col-span-1">
                  <Heading variant="heading-strong-s" className="mb-3">Summary</Heading>
                  <div className="bg-white rounded-lg p-4 border">
                    <Text variant="body-default-s">
                      {metaSummary.summary}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages Display */}
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
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
              <div className="flex justify-start mb-6">
                <div className="bg-white border border-neutral-200 text-neutral-900 shadow-sm rounded-xl px-12 py-8">
                  <Text variant="body-default-s" className="text-gray-500">
                    Thinking...
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Input */}
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
