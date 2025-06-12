"use client";

import { ReactNode, useState } from "react";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

const StatCard = ({ value, label, className = "" }: StatCardProps) => (
  <div className={`backdrop-blur-md bg-white/30 border border-white/40 rounded-2xl px-8 py-6 shadow-xl flex flex-col items-center ${className}`}>
    <div className="text-4xl font-extrabold text-purple-700 mb-1">{value}</div>
    <div className="text-purple-900/80 text-base font-semibold text-center">{label}</div>
  </div>
);

interface FeatureProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

const Feature = ({ icon, title, desc }: FeatureProps) => (
  <div className="flex flex-col items-center bg-white/60 rounded-2xl p-6 shadow-md w-64">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="font-bold text-lg text-purple-800 mb-1">{title}</div>
    <div className="text-purple-700 text-sm text-center">{desc}</div>
  </div>
);

export default function NewLandingPage() {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-50 relative flex flex-col items-center overflow-x-hidden">
      {/* Top Nav */}
      <header className="w-full max-w-6xl flex justify-between items-center px-8 py-8 z-20">
        <div className="flex items-center gap-2">
          {/* Mascot/Logo */}
          <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-400">
            <span className="text-2xl">🕵️‍♂️</span>
          </div>
          <span className="font-extrabold text-2xl text-purple-800 tracking-tight">LegalEase</span>
        </div>
        <nav className="hidden md:flex gap-8 text-purple-700 text-sm font-medium">
          <a href="#" className="hover:text-purple-900 transition">How it works</a>
          <a href="#" className="hover:text-purple-900 transition">Features</a>
          <a href="#" className="hover:text-purple-900 transition">FAQ</a>
        </nav>
        <a href="#" className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition text-sm">Try It Now</a>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 w-full relative z-10 mt-8 mb-16">
        {/* Mascot and Headline */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-yellow-200 border-4 border-purple-300 flex items-center justify-center shadow-xl mb-4 animate-bounce">
            <span className="text-6xl">🤖</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-purple-900 text-center mb-2 leading-tight drop-shadow-lg">
            Decode Legal Jargon Instantly!
          </h1>
          <p className="text-purple-700 text-lg md:text-2xl text-center max-w-2xl mb-6 font-medium">
            We turn complex website policies into plain English you can actually understand. <span className="text-pink-500 font-bold">No more legalese headaches!</span>
          </p>
        </div>
        {/* Demo Input */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full max-w-xl">
          <input
            className="flex-1 px-5 py-3 rounded-xl border-2 border-purple-300 focus:border-pink-400 outline-none text-lg shadow-md bg-white/80 placeholder-purple-400"
            placeholder="Paste a website URL or upload a file..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition flex items-center gap-2">
            <span>🔍</span> Try It Now
          </button>
          <button className="bg-yellow-300 text-purple-900 px-5 py-3 rounded-xl font-bold text-lg shadow hover:bg-yellow-400 transition flex items-center gap-2">
            <span>✨</span> See Example
          </button>
        </div>
        {/* Fun Stat Cards */}
        <div className="flex flex-wrap gap-8 justify-center mb-12">
          <StatCard value="1000+" label="Policies Decoded" />
          <StatCard value="95%" label="User Satisfaction" />
          <StatCard value="3s" label="Avg. Time to Summarize" />
        </div>
        {/* Features */}
        <div className="flex flex-wrap gap-8 justify-center mb-16">
          <Feature icon={<span>🧠</span>} title="AI-Powered Summaries" desc="Get the gist of any policy in seconds—no more endless scrolling." />
          <Feature icon={<span>💬</span>} title="Ask Anything" desc="Type your questions and get clear, friendly answers about any document." />
          <Feature icon={<span>🔑</span>} title="Key Points Only" desc="We highlight what matters most—skip the fluff, spot the risks." />
          <Feature icon={<span>🎉</span>} title="Fun & Friendly" desc="Legal doesn't have to be boring. Enjoy a playful, easy experience!" />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-purple-400 text-base py-8 border-t border-purple-200 z-10 relative font-semibold">
        Not a lawyer, but your best legal sidekick! 🚀
      </footer>
    </div>
  );
}
