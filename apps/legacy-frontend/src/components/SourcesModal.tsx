"use client";

import {
  Button,
  Dialog,
  Text
} from "@once-ui-system/core";
import { useEffect, useState } from "react";

interface Source {
  title: string;
  url: string;
}

interface SourcesModalProps {
  isOpen: boolean;
  companySlug: string;
  onClose: () => void;
}

export function SourcesModal({ isOpen, onClose, companySlug }: SourcesModalProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && companySlug) {
      fetchSources();
    }
  }, [isOpen, companySlug]);

  async function fetchSources() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/companies/${companySlug}/sources`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sources: ${response.status}`);
      }

      const data = await response.json();
      setSources(data.sources || []);
    } catch (err) {
      console.error("Error fetching sources:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sources");
    } finally {
      setLoading(false);
    }
  }

  function handleSourceClick(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Sources (${sources.length})`}
    >
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <Text variant="body-default-s" className="text-gray-500">
                Loading sources...
              </Text>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <Text variant="body-default-m" className="text-red-600 mb-4">
              {error}
            </Text>
            <Button
              size="s"
              variant="secondary"
              onClick={fetchSources}
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && sources.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <Text variant="body-default-m" className="text-gray-600">
              No sources found for this company.
            </Text>
          </div>
        )}

        {!loading && !error && sources.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sources.map((source, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => handleSourceClick(source.url)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Text variant="body-default-m" className="text-gray-900 font-medium mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {source.title}
                    </Text>
                    <Text variant="body-default-s" className="text-gray-500 truncate">
                      {source.url}
                    </Text>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            size="m"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
