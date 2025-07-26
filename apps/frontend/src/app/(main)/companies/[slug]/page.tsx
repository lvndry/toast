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
  const [expandedScores, setExpandedScores] = useState<Set<string>>(new Set());

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
        content: data.answerI,
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

  function handleKeyPress(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function toggleScoreExpansion(scoreKey: string) {
    setExpandedScores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scoreKey)) {
        newSet.delete(scoreKey);
      } else {
        newSet.add(scoreKey);
      }
      return newSet;
    });
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <Heading variant="heading-strong-l" className="text-gray-900 mb-3">
                Oops! Something went wrong
              </Heading>
              <Text variant="body-default-l" className="text-gray-600 mb-6">
                {error}
              </Text>
              <Button
                size="m"
                variant="primary"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <Text variant="body-default-l" className="text-gray-600">Loading company information...</Text>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <Heading variant="heading-strong-l" className="text-gray-900 mb-3">
                Company Not Found
              </Heading>
              <Text variant="body-default-l" className="text-gray-600 mb-6">
                The company you're looking for doesn't exist.
              </Text>
              <Button
                size="m"
                variant="primary"
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Heading variant="heading-strong-l" className="text-gray-900">{company.name}</Heading>
                <Text variant="body-default-s" className="text-gray-500">Privacy Analysis & Chat</Text>
              </div>
            </div>
            <Button
              size="s"
              variant="secondary"
              prefixIcon="arrowLeft"
              onClick={() => window.history.back()}
              className="hover:bg-gray-100 transition-colors"
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Enhanced Meta Summary Display */}
        {metaSummary && (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Modern Scores Section */}
              <div className="mb-8">
                <Heading variant="heading-strong-m" className="mb-6 text-gray-900">Privacy Analysis Scores</Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(metaSummary.scores).map(([key, score]) => {
                    const isExpanded = expandedScores.has(key);
                    return (
                      <div key={key} className="group relative">
                        <div
                          className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${isExpanded ? 'ring-2 ring-blue-500/20 shadow-lg' : 'hover:-translate-y-1'
                            }`}
                          onClick={() => toggleScoreExpansion(key)}
                        >
                          <div className="p-4">
                            <div className="text-center">
                              <Text variant="label-default-s" className="text-gray-600 mb-2 font-medium">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Text>
                              <div className="relative">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                  {score.score}/10
                                </div>
                              </div>
                            </div>

                            {/* Expandable Justification */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                              }`}>
                              <div className="border-t border-gray-200 pt-4">
                                <div className="space-y-3">
                                  <div>
                                    <Text variant="body-default-s" className="text-gray-600 leading-relaxed">
                                      {score.justification || "No justification provided for this score."}
                                    </Text>
                                  </div>

                                  {/* Recommendations section - only show if recommendations exist in the data */}
                                  {score.recommendations && score.recommendations.length > 0 && (
                                    <div>
                                      <Text variant="label-default-s" className="text-gray-700 font-semibold mb-2">
                                        Recommendations
                                      </Text>
                                      <ul className="space-y-2">
                                        {score.recommendations.map((rec: string, index: number) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <Text variant="body-default-s" className="text-gray-600 text-sm">
                                              {rec}
                                            </Text>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expand/Collapse Indicator */}
                            <div className="flex justify-center mt-3">
                              <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                                }`}>
                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Enhanced Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Key Points Section */}
                <div className="lg:col-span-2">
                  <Heading variant="heading-strong-s" className="mb-4 text-gray-900">Key Points</Heading>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                    <ul className="space-y-3">
                      {(showAllKeyPoints ? metaSummary.keypoints : metaSummary.keypoints.slice(0, 5)).map((point, index) => (
                        <li key={index} className="flex items-start gap-3 group">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2.5 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                          <Text variant="body-default-s" className="text-gray-700 leading-relaxed">{point}</Text>
                        </li>
                      ))}
                    </ul>
                    {metaSummary.keypoints.length > 5 && (
                      <Button
                        size="s"
                        variant="secondary"
                        onClick={() => setShowAllKeyPoints(!showAllKeyPoints)}
                        className="mt-4 hover:bg-gray-100 transition-colors"
                      >
                        {showAllKeyPoints ? 'Show Less' : `Show All ${metaSummary.keypoints.length} Points`}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-1">
                  <Heading variant="heading-strong-s" className="mb-4 text-gray-900">Summary</Heading>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                    <Text variant="body-default-s" className="text-gray-700 leading-relaxed">
                      {metaSummary.summary}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Chat Messages Display */}
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <Heading variant="heading-strong-m" className="text-gray-900 mb-2">Start a conversation</Heading>
                <Text variant="body-default-l" className="text-gray-600">
                  Ask about privacy practices, data collection, user rights, and more
                </Text>
              </div>
            )}

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
                <div className="bg-white/80 backdrop-blur-sm border border-white/20 text-gray-900 shadow-sm rounded-2xl px-6 py-4 max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <Text variant="body-default-s" className="text-gray-500">
                      Thinking...
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Chat Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-white/20 shadow-lg">
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
