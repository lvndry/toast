"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Company {
  id: string;
  name: string;
  domain?: string;
  slug?: string;
}

export default function ChatbotPage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [metaSummary, setMetaSummary] = useState<string>('');
  const [displayedSummary, setDisplayedSummary] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse position tracking for background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch company data and meta summary
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_TOAST_API || '';

        // Fetch company details
        const companyResponse = await fetch(`${apiUrl}/toast/companies/${id}`);
        if (!companyResponse.ok) {
          throw new Error('Company not found');
        }
        const companyData = await companyResponse.json();
        setCompany(companyData);

        // Fetch meta summary
        const metaResponse = await fetch(`${apiUrl}/toast/companies/meta-summary/${id}`);
        if (!metaResponse.ok) {
          throw new Error('Failed to fetch meta summary');
        }
        // Handle streaming response
        const metaText = await metaResponse.json();
        setMetaSummary(metaText.summary);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsFetchingMeta(false);
      }
    };

    fetchData();
  }, [id]);

  // Typewriter effect for meta summary
  useEffect(() => {
    if (!metaSummary) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= metaSummary.length) {
        setDisplayedSummary(metaSummary.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 10); // Adjust speed here

    return () => clearInterval(interval);
  }, [metaSummary]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedSummary]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !company) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_TOAST_API || '';
      const response = await fetch(`${apiUrl}/toast/q`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim(),
          company_slug: company.slug || company.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || data.response || data
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/companies" className="text-blue-400 hover:text-blue-300">
            Back to companies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-50">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-purple-950 to-black">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 50%)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 px-8 py-6 backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-500">
                <span className="text-2xl">🍞</span>
              </div>
              <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Toast AI
            </span>
          </Link>

          <Link
            href="/companies"
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Companies
          </Link>
        </div>
      </nav>

      {/* Main Chat Interface */}
      <main className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-8 py-8">
        {/* Company Header */}
        {company && (
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">
              Chat with <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{company.name}</span>
            </h1>
            <p className="text-gray-400">Ask questions about their privacy policy, terms of service, or cookie policy</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Meta Summary */}
          {displayedSummary && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">Meta Summary</p>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{displayedSummary}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Meta Summary */}
          {isFetchingMeta && (
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-white/10 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${message.role === 'user'
                  ? 'bg-blue-600/20 backdrop-blur-md border border-blue-500/20'
                  : 'bg-white/5 backdrop-blur-md border border-white/10'
                  }`}
              >
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">👤</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about their policies..."
            disabled={isLoading || isFetchingMeta}
            className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isFetchingMeta}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}
