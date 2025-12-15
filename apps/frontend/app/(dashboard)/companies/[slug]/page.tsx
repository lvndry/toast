"use client";

import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import { DataStory } from "@/components/dashboard/overview/data-story";
import { SharingMap } from "@/components/dashboard/overview/sharing-map";
import { VerdictHero } from "@/components/dashboard/overview/verdict-hero";
import { YourPower } from "@/components/dashboard/overview/your-power";
import { SourcesList } from "@/components/dashboard/sources-list";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataPurposeLink {
  data_type: string;
  purposes: string[];
}

interface ThirdPartyRecipient {
  recipient: string;
  data_shared: string[];
  purpose?: string | null;
  risk_level: "low" | "medium" | "high";
}

interface CompanyOverview {
  company_name: string;
  company_slug: string;
  last_updated: string; // ISO datetime string
  verdict:
    | "very_user_friendly"
    | "user_friendly"
    | "moderate"
    | "pervasive"
    | "very_pervasive";
  risk_score: number;
  one_line_summary: string;
  data_collected?: string[] | null;
  data_purposes?: string[] | null;
  // New structured fields
  data_collection_details?: DataPurposeLink[] | null;
  third_party_details?: ThirdPartyRecipient[] | null;
  your_rights?: string[] | null;
  dangers?: string[] | null;
  benefits?: string[] | null;
  recommended_actions?: string[] | null;
  keypoints?: string[] | null;
  document_counts?: { total: number; analyzed: number; pending: number } | null;
  document_types?: Record<string, number> | null;
  third_party_sharing?: string | null;
}

interface DocumentSummary {
  id: string;
  title: string | null;
  url: string;
  doc_type?: string;
  last_updated?: string | null;
  verdict?: string | null;
  risk_score?: number | null;
}

function DeepAnalysisTab({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeepAnalysis() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/companies/${slug}/deep-analysis`);

        if (res.ok) {
          const json = await res.json();
          setDeepAnalysis(json);
        } else {
          setError("Failed to fetch deep analysis");
        }
      } catch (err) {
        console.error("Failed to fetch deep analysis", err);
        setError("Failed to fetch deep analysis");
      } finally {
        setLoading(false);
      }
    }
    fetchDeepAnalysis();
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !deepAnalysis) {
    return (
      <ErrorDisplay
        variant="error"
        title="Analysis Unavailable"
        message={error || "Deep analysis is not available for this company."}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Risk Prioritization */}
      {deepAnalysis.risk_prioritization && (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Prioritization</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {deepAnalysis.risk_prioritization.critical?.length > 0 && (
              <div>
                <h3 className="font-medium text-red-600 mb-2">Critical</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {deepAnalysis.risk_prioritization.critical.map(
                    (risk: string, i: number) => (
                      <li key={i}>{risk}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
            {deepAnalysis.risk_prioritization.high?.length > 0 && (
              <div>
                <h3 className="font-medium text-orange-600 mb-2">High</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {deepAnalysis.risk_prioritization.high.map(
                    (risk: string, i: number) => (
                      <li key={i}>{risk}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
            {deepAnalysis.risk_prioritization.medium?.length > 0 && (
              <div>
                <h3 className="font-medium text-yellow-600 mb-2">Medium</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {deepAnalysis.risk_prioritization.medium.map(
                    (risk: string, i: number) => (
                      <li key={i}>{risk}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
            {deepAnalysis.risk_prioritization.low?.length > 0 && (
              <div>
                <h3 className="font-medium text-green-600 mb-2">Low</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {deepAnalysis.risk_prioritization.low.map(
                    (risk: string, i: number) => (
                      <li key={i}>{risk}</li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Compliance */}
      {deepAnalysis.enhanced_compliance &&
        Object.keys(deepAnalysis.enhanced_compliance).length > 0 && (
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Compliance Analysis</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(deepAnalysis.enhanced_compliance).map(
                ([reg, comp]: [string, any]) => (
                  <div key={reg} className="border rounded p-4">
                    <h3 className="font-semibold mb-2">{reg}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Status: </span>
                        <span>{comp.status}</span>
                      </div>
                      <div>
                        <span className="font-medium">Score: </span>
                        <span>{comp.score}/10</span>
                      </div>
                      {comp.violations?.length > 0 && (
                        <div>
                          <span className="font-medium">Violations: </span>
                          <ul className="list-disc list-inside mt-1">
                            {comp.violations.map((v: any, i: number) => (
                              <li key={i}>{v.requirement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

      {/* Business Impact */}
      {deepAnalysis.business_impact && (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Business Impact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">For Individuals</h3>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Privacy Risk: </span>
                  <span>
                    {
                      deepAnalysis.business_impact.for_individuals
                        ?.privacy_risk_level
                    }
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {
                    deepAnalysis.business_impact.for_individuals
                      ?.data_exposure_summary
                  }
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">For Businesses</h3>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">Vendor Risk: </span>
                  <span>
                    {
                      deepAnalysis.business_impact.for_businesses
                        ?.vendor_risk_score
                    }
                    /10
                  </span>
                </div>
                <div>
                  <span className="font-medium">Liability Exposure: </span>
                  <span>
                    {
                      deepAnalysis.business_impact.for_businesses
                        ?.liability_exposure
                    }
                    /10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Analyses */}
      {deepAnalysis.document_analyses?.length > 0 && (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Document-by-Document Analysis
          </h2>
          <div className="space-y-6">
            {deepAnalysis.document_analyses.map(
              (docAnalysis: any, i: number) => (
                <div key={i} className="border rounded p-4">
                  <h3 className="font-semibold mb-2">
                    {docAnalysis.title || docAnalysis.document_type}
                  </h3>
                  <div className="text-sm space-y-2">
                    {docAnalysis.critical_clauses?.length > 0 && (
                      <div>
                        <span className="font-medium">Critical Clauses: </span>
                        <ul className="list-disc list-inside mt-1">
                          {docAnalysis.critical_clauses
                            .slice(0, 3)
                            .map((clause: any, j: number) => (
                              <li key={j}>
                                {clause.clause_type} ({clause.risk_level})
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Cross-Document Analysis */}
      {deepAnalysis.cross_document_analysis && (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Cross-Document Analysis
          </h2>
          {deepAnalysis.cross_document_analysis.contradictions?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Contradictions</h3>
              <div className="space-y-2">
                {deepAnalysis.cross_document_analysis.contradictions.map(
                  (cont: any, i: number) => (
                    <div key={i} className="border rounded p-3 text-sm">
                      <div className="font-medium">{cont.description}</div>
                      <div className="text-muted-foreground mt-1">
                        {cont.document_a} vs {cont.document_b}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
          {deepAnalysis.cross_document_analysis.information_gaps?.length >
            0 && (
            <div>
              <h3 className="font-medium mb-2">Information Gaps</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {deepAnalysis.cross_document_analysis.information_gaps.map(
                  (gap: string, i: number) => (
                    <li key={i}>{gap}</li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompanyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<CompanyOverview | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/meta-summary/${slug}`);

        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          console.error("Failed to fetch company overview:", res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch company data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Fetch documents when sources tab might be viewed
  useEffect(() => {
    async function fetchDocuments() {
      setDocumentsLoading(true);
      try {
        const res = await fetch(`/api/companies/${slug}/documents`);

        if (res.ok) {
          const json = await res.json();
          setDocuments(json);
        } else {
          console.error("Failed to fetch company documents:", res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch company documents", error);
      } finally {
        setDocumentsLoading(false);
      }
    }
    fetchDocuments();
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <ErrorDisplay
        variant="not-found"
        title="Company Not Found"
        message="The company you're looking for doesn't exist or has been removed."
        actionLabel="Browse Companies"
        actionHref="/companies"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {data.company_name}
        </h1>
        <p className="text-muted-foreground">Privacy Analysis & Overview</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {/*           <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
           */}
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Section 1: Verdict Hero */}
          <VerdictHero
            companyName={data.company_name}
            verdict={data.verdict}
            riskScore={data.risk_score}
            summary={data.one_line_summary}
            keypoints={data.keypoints}
          />

          {/* Section 2: Data Story */}
          <DataStory
            dataCollectionDetails={data.data_collection_details}
            dataCollected={data.data_collected}
            dataPurposes={data.data_purposes}
          />

          {/* Section 3: Sharing Map */}
          <SharingMap
            thirdPartyDetails={data.third_party_details}
            thirdPartySharing={data.third_party_sharing}
          />

          {/* Section 4: Your Power */}
          <YourPower
            rights={data.your_rights}
            dangers={data.dangers}
            benefits={data.benefits}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <DeepAnalysisTab slug={slug} />
        </TabsContent>

        <TabsContent value="sources">
          {documentsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : (
            <SourcesList documents={documents} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
