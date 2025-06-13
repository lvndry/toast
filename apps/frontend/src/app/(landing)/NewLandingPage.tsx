"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Company {
  id: string;
  name: string;
  domain?: string;
}

export default function NewLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    setCompaniesError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_TOAST_API || '';
      const response = await fetch(`${apiUrl}/companies`);

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      setCompanies(data);
      console.log('Fetched companies:', data);

      // Navigate to companies page after successful fetch
      router.push('/companies');
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompaniesError(error instanceof Error ? error.message : 'Failed to fetch companies');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-50">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Dynamic gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-purple-950 to-black">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
          }}
        />
      </div>

      {/* Animated grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-6 backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-500">
                <span className="text-2xl">🍞</span>
              </div>
              <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Toast AI
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className="relative text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-500" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium">
              Sign In
            </button>
            <button className="relative group px-6 py-2.5 overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-500 group-hover:scale-110" />
              <span className="relative z-10 text-sm font-semibold">Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-8 pt-20">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
            style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]"
            style={{ transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)` }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Floating badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-500 cursor-pointer group"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">AI-Powered Legal Analysis</span>
            <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Main headline with split animation */}
          <h1 className="mb-8">
            <div className="overflow-hidden">
              <div
                className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.8] mb-4"
                style={{ transform: `translateY(${scrollY * -0.2}px)` }}
              >
                Understand Legal
              </div>
            </div>
            <div className="overflow-hidden">
              <div
                className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.8]"
                style={{ transform: `translateY(${scrollY * -0.15}px)` }}
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Documents
                </span>
                <span className="text-white/20"> Instantly</span>
              </div>
            </div>
          </h1>

          {/* Subheading */}
          <p
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            Transform complex privacy policies, terms of service, and cookie policies into
            <span className="text-white font-medium"> clear, actionable insights</span>.
            Know what you&apos;re agreeing to in seconds, not hours.
          </p>

          {/* CTA Buttons with magnetic effect */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          >
            <button
              onClick={fetchCompanies}
              disabled={isLoadingCompanies}
              className="group relative px-8 py-4 overflow-hidden rounded-2xl bg-white text-black font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2">
                {isLoadingCompanies ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    Try Free Analysis
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
            <button className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Error/Success Messages */}
          {companiesError && (
            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {companiesError}
            </div>
          )}

          {companies.length > 0 && !isLoadingCompanies && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Successfully loaded {companies.length} companies! Check the console for details.
            </div>
          )}

          {/* Bento grid stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { value: '50,000+', label: 'Documents Analyzed', color: 'from-blue-500 to-cyan-500' },
              { value: '99.2%', label: 'Accuracy Rate', color: 'from-purple-500 to-pink-500' },
              { value: '< 30s', label: 'Analysis Time', color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer"
                style={{
                  transform: `translateY(${scrollY * -(0.05 + index * 0.02)}px)`,
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* Dashboard Preview with Bento Layout */}
      <section className="relative py-32 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Powerful analysis,
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> beautiful insights</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our AI breaks down complex legal jargon into visual, easy-to-understand insights
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main dashboard preview */}
            <div className="lg:col-span-8 group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              <div className="relative rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-500">
                {/* Browser header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((color, i) => (
                        <div key={i} className={`w-3 h-3 ${color} rounded-full hover:scale-125 transition-transform cursor-pointer`} />
                      ))}
                    </div>
                    <div className="px-4 py-1 rounded-lg bg-white/5 text-xs text-gray-400 font-mono">
                      toast.ai/analyze
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>

                {/* Dashboard content */}
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                      🍞
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Privacy Policy Analysis</h3>
                      <p className="text-gray-400 text-sm">stripe.com • Analyzing...</p>
                    </div>
                  </div>

                  {/* Progress animation */}
                  <div className="space-y-4">
                    {['Extracting text content', 'Identifying key sections', 'Analyzing privacy practices', 'Generating insights'].map((step, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 ${i < 3 ? 'border-green-500 bg-green-500' : 'border-gray-600'} flex items-center justify-center`}>
                          {i < 3 && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>}
                        </div>
                        <span className={`text-sm ${i < 3 ? 'text-white' : 'text-gray-500'}`}>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Processing indicator */}
                  <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse">
                        <span className="text-xs font-bold">AI</span>
                      </div>
                      <p className="text-sm text-gray-300">Processing document with advanced AI models...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side panels */}
            <div className="lg:col-span-4 space-y-6">
              {/* Trust score card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="relative p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Trust Score</h4>
                    <span className="text-3xl font-bold text-green-400">8.4</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[84%] bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Based on 12 privacy factors</p>
                </div>
              </div>

              {/* Key findings */}
              <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-500">
                <h4 className="font-semibold mb-4">Key Findings</h4>
                <div className="space-y-3">
                  {[
                    { icon: '✓', text: 'GDPR Compliant', color: 'text-green-400' },
                    { icon: '⚠', text: 'Third-party sharing', color: 'text-yellow-400' },
                    { icon: 'ℹ', text: '90-day retention', color: 'text-blue-400' },
                  ].map((finding, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-lg ${finding.color}`}>{finding.icon}</span>
                      <span className="text-sm text-gray-300">{finding.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"> stay informed</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Deep Analysis',
                description: 'AI-powered analysis that understands context and nuance',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Get comprehensive results in under 30 seconds',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🛡️',
                title: 'Privacy First',
                description: 'Your documents are never stored or shared',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: '📊',
                title: 'Visual Reports',
                description: 'Beautiful, easy-to-understand visual breakdowns',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: '🌐',
                title: 'Multi-language',
                description: 'Support for 30+ languages worldwide',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: '🔄',
                title: 'Regular Updates',
                description: 'AI models updated with latest regulations',
                gradient: 'from-pink-500 to-rose-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-medium tracking-widest uppercase mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['Stripe', 'Notion', 'Linear', 'Vercel', 'Figma', 'GitHub'].map((company) => (
              <span key={company} className="text-2xl font-semibold text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
