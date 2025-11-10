"use client";

import { FiExternalLink } from "react-icons/fi";

import {
  Box,
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
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const linkColor = useColorModeValue("blue.600", "blue.400");

  if (documents.length === 0) {
    return null;
  }

  return (
    <Box p={6}>
      <Box maxW="7xl" mx="auto">
        <Heading size="md" mb={4}>
          Source Documents
        </Heading>
        <Box bg={cardBg} borderRadius="lg" shadow="sm" overflow="hidden">
          <TableContainer>
            <Table variant="simple">
              <Tbody>
                {documents.map((doc) => (
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
        </Box>
      </Box>
    </Box>
  );
}
