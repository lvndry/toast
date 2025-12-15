"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useState } from "react";

import { Button } from "@/components/ui/button";

const COMPANIES = [
  {
    id: "spotify",
    name: "Spotify",
    riskScore: 7.5,
    verdict: "Pervasive",
    findings: [
      { type: "risk", text: "Shares listening data with advertisers" },
      { type: "risk", text: "Indefinite data retention policy" },
      { type: "safe", text: "TLS 1.3 encrypted data transmission" },
      { type: "safe", text: "GDPR compliant for EU users" },
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    riskScore: 4.2,
    verdict: "User Friendly",
    findings: [
      { type: "safe", text: "No data selling to third parties" },
      { type: "safe", text: "Clear data deletion policy" },
      { type: "safe", text: "Encrypted data storage" },
      { type: "risk", text: "Tracks viewing habits for recommendations" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    riskScore: 9.2,
    verdict: "Very Pervasive",
    findings: [
      { type: "risk", text: "Collects biometric data (face, voice)" },
      { type: "risk", text: "Shares data with global affiliates" },
      { type: "risk", text: "Mandatory arbitration clause" },
      { type: "risk", text: "Broad intellectual property claims" },
    ],
  },
];

export function InteractiveDemo() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const handleScan = (company: (typeof COMPANIES)[0]) => {
    if (company.id === selectedCompany.id && showResults) return;

    setSelectedCompany(company);
    setIsScanning(true);
    setShowResults(false);

    setTimeout(() => {
      setIsScanning(false);
      setShowResults(true);
    }, 1200);
  };

  return (
    <section
      id="demo"
      className="py-32 bg-white relative overflow-hidden w-full"
    >
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            See it in <span className="text-gradient">action</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Click on any service below to run an instant privacy policy
            analysis.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Company Selector */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {COMPANIES.map((company) => (
              <button
                key={company.id}
                onClick={() => handleScan(company)}
                className={`px-8 py-3 rounded-full border transition-all duration-300 font-medium ${
                  selectedCompany.id === company.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card/30 border-white/5 hover:bg-card/50 hover:border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {company.name}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="relative rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl overflow-hidden min-h-[400px] shadow-2xl">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                  </div>
                  <p className="text-xl font-semibold">
                    Analyzing {selectedCompany.name}...
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Reading privacy policy
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 md:p-12"
                >
                  <div className="flex flex-col md:flex-row gap-12">
                    {/* Score Column */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center text-center md:w-48">
                      <div
                        className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4 ${
                          selectedCompany.riskScore > 7
                            ? "border-red-500/30 text-red-500"
                            : selectedCompany.riskScore > 4
                              ? "border-amber-500/30 text-amber-500"
                              : "border-green-500/30 text-green-500"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl font-bold tracking-tighter">
                            {selectedCompany.riskScore}
                          </div>
                          <div className="text-xs font-medium uppercase tracking-widest mt-1 opacity-60">
                            Risk Score
                          </div>
                        </div>
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          selectedCompany.riskScore > 7
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : selectedCompany.riskScore > 4
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-green-500/10 text-green-500 border border-green-500/20"
                        }`}
                      >
                        {selectedCompany.verdict}
                      </div>
                    </div>

                    {/* Findings Column */}
                    <div className="flex-grow space-y-6">
                      <h3 className="text-xl font-bold">Key Findings</h3>
                      <div className="space-y-3">
                        {selectedCompany.findings.map((finding, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: i * 0.05,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className={`flex items-start gap-3 p-4 rounded-xl border ${
                              finding.type === "risk"
                                ? "bg-red-500/5 border-red-500/10"
                                : "bg-green-500/5 border-green-500/10"
                            }`}
                          >
                            <div
                              className={`mt-0.5 p-1.5 rounded-full ${
                                finding.type === "risk"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-green-500/10 text-green-500"
                              }`}
                            >
                              {finding.type === "risk" ? (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                              {finding.text}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <Button variant="default" size="sm" asChild>
                          <Link href="/companies">
                            Try it yourself{" "}
                            <ArrowRight className="ml-1 w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
