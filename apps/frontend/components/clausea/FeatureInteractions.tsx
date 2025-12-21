"use client";

import gsap from "gsap";
import { AlertCircle, MessageSquare, Search, Sparkles } from "lucide-react";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";

export default function FeatureInteractions() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function simulateQuery() {
    if (!query) return;
    setIsTyping(true);
    setShowResult(false);

    setTimeout(() => {
      setIsTyping(false);
      setShowResult(true);
    }, 1500);
  }

  useGSAP(() => {
    if (showResult) {
      gsap.from(resultRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".result-chunk", {
        x: -10,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.3,
      });
    }
  }, [showResult]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-primary/10 shadow-2xl overflow-hidden">
      <div className="bg-primary/5 p-8 border-b border-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h4 className="font-display font-bold text-primary">
              Interactive RAG Demo
            </h4>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Try querying a policy
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="p-8">
        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && simulateQuery()}
            placeholder="e.g., 'What happens to my data if I delete my account?'"
            className="w-full h-16 bg-neutral rounded-2xl px-14 text-primary font-medium outline-none focus:ring-2 ring-secondary/50 transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/30" />
          <Button
            onClick={simulateQuery}
            disabled={isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl"
          >
            {isTyping ? "Analyzing..." : "Ask AI"}
          </Button>
        </div>

        {isTyping && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">
              Scanning Document context...
            </p>
          </div>
        )}

        {showResult && (
          <div ref={resultRef} className="space-y-6">
            <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-bold text-secondary uppercase tracking-widest">
                  AI Synthesis
                </span>
              </div>
              <p className="text-primary leading-relaxed mb-4">
                Based on{" "}
                <span className="font-bold underline">
                  Section 12.3: Data Retention
                </span>
                , upon request for account deletion:
              </p>
              <ul className="space-y-3">
                {[
                  "Personally identifiable data is removed from active servers within 30 days.",
                  "System logs are anonymized and stored for 180 days for security auditing.",
                  "Backup archives may hold data for up to 1 year, strictly for disaster recovery.",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="result-chunk flex gap-3 text-sm text-primary/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-medium">
                Note: This summary does not constitute formal legal advice.
                Refer to the full text in your dashboard for compliance filing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
