"use client";

import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  TrendingUp,
  Upload,
  X,
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getVerdictConfig } from "@/lib/verdict";
import type { Company, Conversation } from "@/types";
import { useClerk, useUser } from "@clerk/nextjs";
import { useAnalytics } from "@hooks/useAnalytics";

// Company card component with lazy logo loading
function CompanyCard({
  company,
  index,
  verdict,
  riskScore,
  onMouseEnter,
  onClick,
}: {
  company: Company;
  index: number;
  verdict?: string;
  riskScore?: number;
  onMouseEnter: () => void;
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

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 hover:border-primary/30",
        "bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm",
        "hover:scale-[1.02]",
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 30}ms both`,
      }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-5">
          {/* Logo and Verdict */}
          <div className="flex items-start justify-between">
            <div className="relative">
              {isLoadingLogo ? (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center animate-pulse">
                  <Spinner size="sm" />
                </div>
              ) : logo ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-border shadow-lg group-hover:border-primary/50 group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-contain p-2"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {verdictConfig && (
              <Badge
                variant={verdictConfig.variant}
                className={cn(
                  "gap-1.5 px-3 py-1 text-xs font-semibold shadow-sm",
                  verdictConfig.cardBg,
                  "group-hover:scale-105 transition-transform",
                )}
              >
                <verdictConfig.cardIcon className="h-3 w-3" />
                {verdictConfig.label}
              </Badge>
            )}
          </div>

          {/* Company Info */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              {company.name}
            </h3>
            {company.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {company.description}
              </p>
            )}
          </div>

          {/* Risk Score */}
          {riskScore !== undefined && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Risk:
              </span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 shadow-sm",
                    riskScore >= 7
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : riskScore >= 4
                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                        : "bg-gradient-to-r from-green-500 to-green-600",
                  )}
                  style={{ width: `${(riskScore / 10) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums min-w-[2.5rem] text-right">
                {Math.round(riskScore)}/10
              </span>
            </div>
          )}
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
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Company Directory
              </h1>
              <p className="text-muted-foreground">
                Analyze legal documents from thousands of companies with AI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        {/* Search and Filter Section */}
        <div className="flex-shrink-0 py-8 space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search companies by name, description, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl border-2 focus:border-primary/50 shadow-sm transition-all hover:shadow-md"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {filteredCompanies.length} company
                {filteredCompanies.length !== 1 ? "ies" : ""} found
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Sort:{" "}
                  {sortBy === "name"
                    ? "Name"
                    : sortBy === "risk"
                      ? "Risk Level"
                      : "Recently Updated"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Sort by Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("risk")}>
                  Sort by Risk Level
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  Sort by Recent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Companies Grid - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
          <div className="px-2 py-6 pb-12">
            {filteredCompanies.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No companies found
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Try adjusting your search terms or browse all companies
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCompanies.map((company, index) => {
                  const verdict = companySummaries[company.slug]?.verdict;
                  const riskScore = companySummaries[company.slug]?.risk_score;

                  return (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      index={index}
                      verdict={verdict}
                      riskScore={riskScore}
                      onMouseEnter={() => fetchMetaSummary(company.slug)}
                      onClick={() => handleCompanyClick(company)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Upload Your Own Documents
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Analyze privacy policies, terms of service, or contracts
            </p>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Company Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Company Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>
              <Textarea
                placeholder="Brief description of the company"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={3}
                className="rounded-lg resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Upload Document <span className="text-destructive">*</span>
              </label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  selectedFile
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                )}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                      selectedFile ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    <Upload
                      className={cn(
                        "h-8 w-8 transition-colors",
                        selectedFile ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "font-medium transition-colors",
                        selectedFile ? "text-primary" : "text-foreground",
                      )}
                    >
                      {selectedFile
                        ? selectedFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOC, DOCX, TXT files supported
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Only legal documents will be processed
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
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <p className="text-sm font-medium truncate flex-1 mr-2">
                    {selectedFile.name}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              disabled={uploadLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadLoading || !selectedFile || !companyName.trim()}
              className="min-w-[180px]"
            >
              {uploadLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload & Analyze"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
