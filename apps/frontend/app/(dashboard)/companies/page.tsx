"use client";

import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  Plus,
  Search,
  ShieldAlert,
  Upload,
} from "lucide-react";
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
import { useClerk, useUser } from "@clerk/nextjs";
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

  // Lazy load logo when card becomes visible
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
                if (res.ok) {
                  return res.json();
                }
                return null;
              })
              .then((data) => {
                if (data?.logo) {
                  setLogo(data.logo);
                }
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
      { rootMargin: "50px" }, // Start loading 50px before card is visible
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [company.slug, company.name, logo, hasTriedLoading]);

  // Lazy load summary data when card becomes visible
  useEffect(() => {
    if (verdict !== undefined || isLoadingSummary) return;

    const summaryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger summary loading by calling the fetchMetaSummary function
            // This will be passed down from the parent component
            fetchMetaSummary && fetchMetaSummary(company.slug);
            summaryObserver.disconnect();
          }
        });
      },
      { rootMargin: "100px" }, // Start loading 100px before card is visible
    );

    if (cardRef.current) {
      summaryObserver.observe(cardRef.current);
    }

    return () => {
      summaryObserver.disconnect();
    };
  }, [company.slug, verdict, isLoadingSummary, fetchMetaSummary]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group cursor-pointer transition-all duration-700 hover:shadow-[0_20px_60px_rgba(59,130,246,0.1)] border-white/5 hover:border-secondary/50",
        "bg-white/3 rounded-4xl overflow-hidden backdrop-blur-sm",
        "hover:scale-[1.02]",
      )}
      onClick={onClick}
      style={{
        animation: `fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms both`,
      }}
    >
      <CardContent className="p-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <div className="relative">
              {isLoadingLogo ? (
                <div className="w-20 h-20 rounded-3xl bg-white/5 animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                </div>
              ) : logo ? (
                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-sm group-hover:shadow-md transition-all duration-500">
                  <img
                    src={logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center font-display font-bold text-3xl shadow-lg group-hover:scale-110 transition-all duration-700">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {verdictConfig && (
              <Badge
                className={cn(
                  "gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full",
                  verdictConfig.cardBg,
                  "group-hover:scale-105 transition-transform duration-500 border-none",
                )}
              >
                <verdictConfig.cardIcon className="h-3.5 w-3.5" />
                {verdictConfig.label}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-bold text-3xl text-primary leading-tight group-hover:translate-x-1 transition-transform duration-500">
              {company.name}
            </h3>
            {company.description && (
              <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                {company.description}
              </p>
            )}
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center gap-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/20">
              Risk Index
            </span>
            {isLoadingSummary ? (
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-full bg-white/5 animate-pulse rounded-full" />
              </div>
            ) : riskScore !== undefined ? (
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    riskScore >= 7
                      ? "bg-red-500"
                      : riskScore >= 4
                        ? "bg-secondary"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${(riskScore / 10) * 100}%` }}
                />
              </div>
            ) : (
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden" />
            )}
            <span className="text-xs font-bold text-primary/60">
              {isLoadingSummary ? (
                <div className="w-8 h-3 bg-white/5 animate-pulse rounded" />
              ) : riskScore !== undefined ? (
                `${Math.round(riskScore)}/10`
              ) : (
                "--/10"
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompaniesPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
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

  // Fetch companies (without logos - logos load lazily)
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const response = await fetch("/api/companies");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch companies: ${response.status}: ${response.statusText}`,
          );
        }

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
          if (res.ok) {
            return res.json();
          }
          return null;
        })
        .then((data) => {
          if (data) {
            setCompanySummaries((s) => ({ ...s, [slug]: data }));
          }
        })
        .catch(() => {
          // ignore
        })
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

  // Apply sorting
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "risk") {
      const ra = companySummaries[a.slug]?.verdict || "";
      const rb = companySummaries[b.slug]?.verdict || "";
      // Ordering: very_pervasive > pervasive > moderate > user_friendly > very_user_friendly
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
    if (!selectedFile || !companyName.trim()) {
      return;
    }

    setUploadLoading(true);
    try {
      trackUserJourney.documentUploadStarted(
        selectedFile.type,
        selectedFile.size,
      );

      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id || "anonymous",
          company_name: companyName,
          company_description: companyDescription,
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation: Conversation = await conversationResponse.json();

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("company_name", companyName);
      if (companyDescription) {
        formData.append("company_description", companyDescription);
      }

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

        if (uploadResponse.status === 400) {
          // Show error message
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      const uploadResult = await uploadResponse.json();

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
    if (file) {
      setSelectedFile(file);
    }
  }

  function handleCompanyClick(company: Company) {
    trackUserJourney.companyViewed(company.slug, company.name);
    router.push(`/c/${company.slug}`);
  }

  function handleSignOut() {
    trackUserJourney.signOut();
    signOut();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-2xl" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Error Loading Companies
                </h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {/* Header */}
      <div className="shrink-0 border-b border-white/5 bg-background/20 backdrop-blur-2xl sticky top-0 z-30 py-2">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 py-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold text-primary tracking-tighter">
                Legal{" "}
                <span className="text-secondary font-serif italic font-normal tracking-normal">
                  Archive
                </span>
              </h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-60">
                Managed Intelligence & Risk Oversight
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="rounded-full px-8 h-12 font-bold uppercase tracking-widest bg-secondary text-primary hover:bg-secondary/80 shadow-xl shadow-secondary/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Index Your Documents
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full px-6 lg:px-8 overflow-hidden">
        {/* Search and Filter Section */}
        <div className="shrink-0 py-6 space-y-4">
          <div className="relative max-w-3xl bg-white/5 rounded-4xl shadow-2xl border border-white/10 overflow-hidden focus-within:border-secondary/50 transition-colors">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/20" />
            <Input
              placeholder="Search by company, industry, or policy risk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-20 h-16 text-lg border-none bg-transparent focus-visible:ring-0 placeholder:text-primary/10 font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 bg-secondary/5 px-6 py-2.5 rounded-full border border-secondary/10">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                {filteredCompanies.length} Active Analyses
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 rounded-full px-6 h-10 border border-white/5"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Sort: {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-3xl p-3 border-white/10 bg-background/95 backdrop-blur-3xl shadow-3xl"
              >
                <DropdownMenuItem
                  className="rounded-2xl h-11 px-4 font-medium"
                  onClick={() => setSortBy("name")}
                >
                  Lexicographical
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-2xl h-11 px-4 font-medium"
                  onClick={() => setSortBy("risk")}
                >
                  Risk Exposure
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-2xl h-11 px-4 font-medium"
                  onClick={() => setSortBy("recent")}
                >
                  Recency
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Companies Grid - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pb-24">
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-10">
              <Building2 className="w-32 h-32 mb-8" />
              <h3 className="text-3xl font-display font-bold tracking-tighter">
                Archive Empty
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-3xl bg-background rounded-5xl p-16 border-white/10 shadow-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary/30 to-transparent" />

          <DialogHeader className="mb-12">
            <DialogTitle className="text-5xl font-display font-bold text-primary tracking-tighter mb-4">
              Expand your{" "}
              <span className="text-secondary font-serif italic font-normal tracking-normal">
                Archive
              </span>
            </DialogTitle>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Upload legal documents for immediate neural indexing and risk
              assessment.
            </p>
          </DialogHeader>

          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary px-2">
                  Entity Name
                </label>
                <Input
                  placeholder="e.g. Gotham Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-16 bg-white/5 rounded-2xl px-8 border-white/10 focus-visible:ring-2 ring-secondary/20 text-lg font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary px-2">
                  Classification
                </label>
                <Input
                  placeholder="e.g. Infrastructure"
                  className="h-16 bg-white/5 rounded-2xl px-8 border-white/10 text-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary px-2">
                Document Source
              </label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-4xl p-16 text-center cursor-pointer transition-all duration-500",
                  selectedFile
                    ? "border-secondary bg-secondary/5"
                    : "border-white/5 hover:border-secondary/30 hover:bg-white/5",
                )}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="flex flex-col items-center gap-6">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-700",
                      selectedFile
                        ? "bg-secondary text-primary rotate-12"
                        : "bg-white/5 text-primary/10",
                    )}
                  >
                    <Upload className="h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-display font-bold text-primary tracking-tight">
                      {selectedFile
                        ? selectedFile.name
                        : "Drop document to index"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                      Neural compatible: PDF, DOCX, TXT
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

            <div className="flex gap-6 justify-end pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full px-10 h-16 font-bold text-primary/30 uppercase tracking-widest hover:text-primary transition-colors"
              >
                Discard
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadLoading || !selectedFile || !companyName.trim()}
                className="rounded-full px-12 h-16 font-bold uppercase tracking-widest bg-secondary text-primary hover:bg-secondary/80 shadow-2xl shadow-secondary/20 min-w-[240px]"
              >
                {uploadLoading ? "Analysing Risk..." : "Commit to Archive"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
