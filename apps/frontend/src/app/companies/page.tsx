"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Company {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  logo?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchCompanies();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchCompanies = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_TOAST_API || '';
      const response = await fetch(`${apiUrl}/toast/companies`);

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 50%)`,
          }}
        />
      </div>

      {/* Animated grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 px-8 py-6 backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            href="/"
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
              Choose a
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Company</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select a company to analyze their privacy policy, terms of service, or cookie policy
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-white/10 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-400">Loading companies...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-400 font-semibold">Error loading companies</p>
                  <p className="text-red-400/70 text-sm mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchCompanies}
                className="mt-4 px-6 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Companies Grid */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompanies.map((company, index) => (
                  <Link
                    href={`/q/${company.id}`}
                    key={company.id}
                    className="group relative block"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 rounded-3xl blur-xl transition-all duration-500" />
                    <div className="relative p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl">
                      {/* Company Logo Placeholder */}
                      <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-2xl font-bold">
                        {company.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Company Info */}
                      <h3 className="text-xl font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                        {company.name}
                      </h3>
                      {company.domain && (
                        <p className="text-gray-400 text-sm mb-4 font-mono">
                          {company.domain}
                        </p>
                      )}

                      {/* Action Button */}
                      <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors">
                        <span>Analyze policies</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* No Results */}
              {filteredCompanies.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl text-gray-400">No companies found matching &ldquo;{searchTerm}&rdquo;</p>
                  <p className="text-gray-500 mt-2">Try a different search term</p>
                </div>
              )}

              {/* Results Count */}
              {filteredCompanies.length > 0 && (
                <div className="text-center mt-12 text-gray-400">
                  <p>Showing {filteredCompanies.length} of {companies.length} companies</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
