"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export interface Document {
  id: string;
  url: string;
  title: string | null;
  doc_type: string;
  company_id: string;
  created_at: string;
}

interface CompanyDocumentsListProps {
  documents: Document[];
}

export default function CompanyDocumentsList({
  documents,
}: CompanyDocumentsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (documents.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  function handlePrevious() {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }

  function handleNext() {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">
          Source Documents ({documents.length})
        </h2>
        <Card>
          <div className="overflow-hidden rounded-md">
            <Table>
              <TableBody>
                {paginatedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">
                          {doc.title || "Untitled Document"}
                        </span>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <Link
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {doc.url}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, documents.length)} of {documents.length}{" "}
                  documents
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
