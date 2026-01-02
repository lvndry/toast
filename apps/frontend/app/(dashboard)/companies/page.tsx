"use client";

import {
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getVerdictConfig } from "@/lib/verdict";
import type { Company, Conversation } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useAnalytics } from "@hooks/useAnalytics";

function CompanyCard({
  company,
  index,
  verdict,
  riskScore,
  isLoadingSummary,
  fetchMetaSummary,
  onClick,
}: {
  company: Company;
  index: number;
  verdict?: string;
  riskScore?: number;
  isLoadingSummary?: boolean;
  fetchMetaSummary?: (slug: string) => void;
  onClick: () => void;
}) {
  const [logo, setLogo] = useState<string | null>(company.logo || null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const verdictConfig = verdict ? getVerdictConfig(verdict) : null;

  // Lazy load logo
  useEffect(() => {
    if (hasTriedLoading || logo || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriedLoading && !logo) {
            setHasTriedLoading(true);
            setIsLoadingLogo(true);

            const params = new URLSearchParams();
            params.append("slug", company.slug);

            fetch(`/api/companies/logos?${params.toString()}`)
              .then((res) => {
                if (res.ok) return res.json();
                return null;
              })
              .then((data) => {
                if (data?.logo) setLogo(data.logo);
              })
              .catch((err) => {
                console.warn(`Failed to fetch logo for ${company.name}:`, err);
              })
              .finally(() => {
                setIsLoadingLogo(false);
              });
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [company.slug, company.name, logo, hasTriedLoading]);

  // Lazy load summary
  useEffect(() => {
    if (verdict !== undefined || isLoadingSummary) return;

    const summaryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && fetchMetaSummary) {
            fetchMetaSummary(company.slug);
            summaryObserver.disconnect();
          }
        });
      },
      { rootMargin: "100px" },
    );

    if (cardRef.current) summaryObserver.observe(cardRef.current);
    return () => summaryObserver.disconnect();
  }, [company.slug, verdict, isLoadingSummary, fetchMetaSummary]);

  const getRiskGradient = (score: number) => {
    if (score >= 7)
      return "from-red-500/20 via-red-500/10 to-transparent border-red-500/30";
    if (score >= 4)
      return "from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30";
    return "from-green-500/20 via-green-500/10 to-transparent border-green-500/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card
        ref={cardRef}
        variant="elevated"
        className={cn(
          "group cursor-pointer overflow-hidden",
          "hover:border-primary/30 hover-glow",
        )}
        onClick={onClick}
      >
        {/* Gradient accent at top */}
        <div
          className={cn(
            "h-1 w-full bg-linear-to-r transition-all duration-500",
            riskScore !== undefined
              ? riskScore >= 7
                ? "from-red-500 via-red-400 to-red-500"
                : riskScore >= 4
                  ? "from-amber-500 via-amber-400 to-amber-500"
                  : "from-green-500 via-green-400 to-green-500"
              : "from-muted via-muted to-muted",
          )}
        />

        <CardContent className="p-6">
          <div className="flex flex-col gap-5">
            {/* Header: Logo + Verdict */}
            <div className="flex items-start justify-between">
              <div className="relative">
                {isLoadingLogo ? (
                  <div className="w-14 h-14 rounded-xl bg-muted animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary/30 animate-bounce" />
                  </div>
                ) : logo ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-background border border-border/50 flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-500">
                    <img
                      src={logo}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary flex items-center justify-center font-display font-bold text-xl shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-500">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {verdictConfig && (
                <Badge
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1 font-bold uppercase tracking-wider rounded-lg",
                    verdictConfig.cardBg,
                    verdictConfig.cardColor,
                  )}
                >
                  <verdictConfig.cardIcon className="h-3 w-3" />
                  {verdictConfig.label}
                </Badge>
              )}
            </div>

            {/* Company Info */}
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                {company.name}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
              {company.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {company.description}
                </p>
              )}
            </div>

            {/* Risk Score */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Privacy Risk
                </span>
                <span className="font-bold text-foreground text-sm">
                  {isLoadingSummary ? (
                    <Skeleton className="w-10 h-4" />
                  ) : riskScore !== undefined ? (
                    <span
                      className={cn(
                        riskScore >= 7
                          ? "text-red-500"
                          : riskScore >= 4
                            ? "text-amber-500"
                            : "text-green-500",
                      )}
                    >
                      {Math.round(riskScore)}/10
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                {isLoadingSummary ? (
                  <div className="h-full w-1/3 bg-muted-foreground/20 animate-pulse rounded-full" />
                ) : riskScore !== undefined ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(riskScore / 10) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className={cn(
                      "h-full rounded-full",
                      riskScore >= 7
                        ? "bg-linear-to-r from-red-500 to-red-400"
                        : riskScore >= 4
                          ? "bg-linear-to-r from-amber-500 to-amber-400"
                          : "bg-linear-to-r from-green-500 to-green-400",
                    )}
                  />
                ) : (
                  <div className="h-full w-0 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CompaniesPage() {
  const { user } = useUser();
  const router = useRouter();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { trackUserJourney, trackPageView } = useAnalytics();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySummaries, setCompanySummaries] = useState<Record<string, any>>(
    {},
  );
  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [sortBy, setSortBy] = useState<"name" | "risk" | "recent">("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Upload form state
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Track page view
  useEffect(() => {
    trackPageView("companies");
  }, [trackPageView]);

  // Track search
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredCount = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
      ).length;
      trackUserJourney.companySearched(searchTerm, filteredCount);
    }
  }, [searchTerm, companies, trackUserJourney]);

  // Fetch companies
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const response = await fetch("/api/companies");
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch companies",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  const fetchMetaSummary = useCallback(
    (slug: string) => {
      if (!slug || companySummaries[slug] || summaryLoading[slug]) return;
      setSummaryLoading((s) => ({ ...s, [slug]: true }));
      fetch(`/api/meta-summary/${slug}`)
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data) setCompanySummaries((s) => ({ ...s, [slug]: data }));
        })
        .catch(() => {})
        .finally(() => {
          setSummaryLoading((s) => ({ ...s, [slug]: false }));
        });
    },
    [companySummaries, summaryLoading],
  );

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "risk") {
      const ra = companySummaries[a.slug]?.verdict || "";
      const rb = companySummaries[b.slug]?.verdict || "";
      const rank = (v: string) =>
        v === "very_pervasive"
          ? 5
          : v === "pervasive"
            ? 4
            : v === "moderate"
              ? 3
              : v === "user_friendly"
                ? 2
                : v === "very_user_friendly"
                  ? 1
                  : 0;
      return rank(rb) - rank(ra);
    }
    if (sortBy === "recent") {
      const ta = new Date(
        companySummaries[a.slug]?.last_updated || 0,
      ).getTime();
      const tb = new Date(
        companySummaries[b.slug]?.last_updated || 0,
      ).getTime();
      return tb - ta;
    }
    return 0;
  });

  async function handleUpload() {
    if (!selectedFile || !companyName.trim()) return;

    setUploadLoading(true);
    try {
      trackUserJourney.documentUploadStarted(
        selectedFile.type,
        selectedFile.size,
      );

      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || "anonymous",
          company_name: companyName,
          company_description: companyDescription,
        }),
      });

      if (!conversationResponse.ok)
        throw new Error("Failed to create conversation");
      const conversation: Conversation = await conversationResponse.json();

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("company_name", companyName);
      if (companyDescription)
        formData.append("company_description", companyDescription);

      const uploadResponse = await fetch(
        `/api/conversations/${conversation.id}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Failed to upload document";
        trackUserJourney.documentUploadFailed(selectedFile.type, errorMessage);
        throw new Error(errorMessage);
      }

      trackUserJourney.documentUploadCompleted(
        selectedFile.type,
        selectedFile.size,
        companyName,
      );
      router.push(`/c/${conversation.id}`);

      setCompanyName("");
      setCompanyDescription("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      if (selectedFile) {
        trackUserJourney.documentUploadFailed(
          selectedFile.type,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    } finally {
      setUploadLoading(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  function handleCompanyClick(company: Company) {
    trackUserJourney.companyViewed(company.slug, company.name);
    router.push(`/companies/${company.slug}`);
  }

  if (loading) {
    return (
      <div className="space-y-10">
        {/* Header skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Search skeleton */}
        <Skeleton className="h-14 w-full rounded-2xl" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[240px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-foreground">
              Error Loading Companies
            </h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
              Service{" "}
              <span className="text-primary font-serif italic">
                Intelligence
              </span>
            </h1>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          AI-powered privacy analysis for the services you use daily. Understand
          what you're agreeing to.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-panel rounded-2xl p-2 flex flex-col md:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
          <Input
            placeholder="Search companies like Spotify, TikTok, or Linear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-none bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/50 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 px-2 md:px-0">
          <div className="hidden md:block w-px h-8 bg-border/50" />

          <Badge variant="secondary" size="lg" className="gap-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            {filteredCompanies.length} companies
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 rounded-xl px-4 hover:bg-muted/50"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="ml-1 capitalize text-primary font-medium">
                  {sortBy}
                </span>
                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl">
              <DropdownMenuItem
                onClick={() => setSortBy("name")}
                className="rounded-lg cursor-pointer"
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("risk")}
                className="rounded-lg cursor-pointer"
              >
                Risk Level (High-Low)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("recent")}
                className="rounded-lg cursor-pointer"
              >
                Recently Updated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredCompanies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6"
          >
            <div className="w-24 h-24 rounded-2xl bg-muted/30 flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display">
                No services found
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Try searching for a different company or check back later for
                new analyses.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCompanies.map((company, index) => {
              const verdict = companySummaries[company.slug]?.verdict;
              const riskScore = companySummaries[company.slug]?.risk_score;
              const isLoadingSummary = summaryLoading[company.slug];

              return (
                <CompanyCard
                  key={company.id}
                  company={company}
                  index={index}
                  verdict={verdict}
                  riskScore={riskScore}
                  isLoadingSummary={isLoadingSummary}
                  fetchMetaSummary={fetchMetaSummary}
                  onClick={() => handleCompanyClick(company)}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-2xl glass-panel p-0 overflow-hidden gap-0 rounded-3xl shadow-2xl border-0">
          <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-primary" />
          <div className="p-8 md:p-10 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-display font-bold tracking-tight">
                Analyze a{" "}
                <span className="text-primary font-serif italic font-normal">
                  Service
                </span>
              </DialogTitle>
              <p className="text-muted-foreground">
                Upload terms of service or privacy policies to generate a
                simplified summary.
              </p>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Entity Name
                  </label>
                  <Input
                    placeholder="e.g. OpenAI"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-12 bg-muted/30 border-border/50 focus:bg-background transition-colors rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Industry
                  </label>
                  <Input
                    placeholder="e.g. AI / Tech"
                    className="h-12 bg-muted/30 border-border/50 focus:bg-background transition-colors rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document
                </label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300",
                    selectedFile
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 hover:border-primary/30 hover:bg-muted/30",
                  )}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                        selectedFile
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Upload className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOCX, or TXT (Max 10MB)
                      </p>
                    </div>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsUploadOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadLoading || !selectedFile || !companyName.trim()}
                className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {uploadLoading ? "Processing..." : "Analyze Document"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
