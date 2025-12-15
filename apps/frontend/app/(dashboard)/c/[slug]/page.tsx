"use client";

import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  company_name: string;
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if slug is a conversation ID (shortuuid is usually 22 chars)
  const isConversationId = /^[a-zA-Z0-9]{22}$/.test(slug);

  useEffect(() => {
    if (!isConversationId) {
      // Redirect to company page if not a conversation ID
      router.replace(`/companies/${slug}`);
      return;
    }

    async function fetchConversation() {
      try {
        const res = await fetch(`/api/conversations/${slug}`);
        if (!res.ok) throw new Error("Conversation not found");
        const data = await res.json();
        setConversation(data);
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    }

    fetchConversation();
  }, [slug, isConversationId, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function handleSendMessage(content: string) {
    if (!conversation) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        },
      );

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.ai_message.content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Ideally show a toast error here
    } finally {
      setSending(false);
    }
  }

  if (!isConversationId) return null; // Will redirect

  if (loading) {
    return (
      <div className="flex h-full flex-col p-6 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b p-4">
        <h1 className="text-lg font-semibold">
          {conversation?.title || "Chat"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {conversation?.company_name}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={handleSendMessage}
            disabled={sending}
            placeholder={`Ask about ${conversation?.company_name}...`}
          />
        </div>
      </div>
    </div>
  );
}
