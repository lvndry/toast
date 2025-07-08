"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { env } from "~/env.mjs";
import type { Company } from "~/types/company";

export default function CompanyChatPage() {
  const { company_slug } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [summary, setSummary] = useState("");
  const [streamed, setStreamed] = useState("");
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "bot"; text: string; }[]>([]);
  const [sending, setSending] = useState(false);

  // Fetch company info and meta-summary
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch all companies to get id from slug
      const companies = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/toast/companies`).then(res => res.json());
      const found = companies.find((c: Company) => c.slug === company_slug);
      setCompany(found);
      if (!found) return setLoading(false);

      // Fetch meta-summary
      const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/toast/companies/meta-summary/${found.id}`);
      const data = await res.json();
      setSummary(data.summary);

      // Simulate streaming
      let i = 0;
      const interval = setInterval(() => {
        setStreamed(data.summary.slice(0, i));
        i += 2;
        if (i > data.summary.length) clearInterval(interval);
      }, 20);
      setLoading(false);
      return () => clearInterval(interval);
    }

    fetchData();
  }, [company_slug]);

  // Handle chat send
  async function handleSend() {
    if (!input.trim() || !company) return;
    setSending(true);
    setChat((c) => [...c, { role: "user", text: input }]);
    setInput("");
    const res = await fetch(`${env.NEXT_PUBLIC_BACKEND_URL}/toast/q`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input, company_slug }),
    });
    const data = await res.json();
    setChat((c) => [...c, { role: "bot", text: data.answer }]);
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg text-neutral-500">Loading company chat...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">{company?.name} Chat</h1>
      <ReactMarkdown>
        {streamed || summary}
      </ReactMarkdown>
      <div className="space-y-2 mb-6">
        {chat.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <ReactMarkdown>
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={sending}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
