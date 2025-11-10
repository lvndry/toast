"use client";

import { FiExternalLink } from "react-icons/fi";

import { useState } from "react";

import {
  Box,
  Button,
  HStack,
  Heading,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";

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
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const linkColor = useColorModeValue("blue.600", "blue.400");
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
    <Box p={6}>
      <Box maxW="7xl" mx="auto">
        <Heading size="md" mb={4}>
          Source Documents ({documents.length})
        </Heading>
        <Box bg={cardBg} borderRadius="lg" shadow="sm" overflow="hidden">
          <TableContainer>
            <Table variant="simple">
              <Tbody>
                {paginatedDocuments.map((doc) => (
                  <Tr key={doc.id} borderBottom={`1px solid ${borderColor}`}>
                    <Td>
                      <Text fontSize="sm">
                        <Text as="span" fontWeight="medium">
                          {doc.title || "Untitled Document"}
                        </Text>
                        <Text as="span" mx={2} color="gray.500">
                          |
                        </Text>
                        <Link
                          href={doc.url}
                          isExternal
                          color={linkColor}
                          display="inline-flex"
                          alignItems="center"
                          gap={1}
                          _hover={{ textDecoration: "underline" }}
                        >
                          {doc.url}
                          <FiExternalLink size={14} />
                        </Link>
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box p={4} borderTop={`1px solid ${borderColor}`}>
              <HStack justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, documents.length)} of {documents.length}{" "}
                  documents
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    onClick={handlePrevious}
                    isDisabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    Page {currentPage} of {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    isDisabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </HStack>
              </HStack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
