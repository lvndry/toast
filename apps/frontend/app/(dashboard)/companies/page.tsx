"use client";

import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack
} from "@chakra-ui/react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiSearch, FiUpload, FiX } from "react-icons/fi";

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  documentsCount?: number;
  logo?: string;
}

interface Conversation {
  id: string;
  user_id: string;
  company_name: string;
  company_description?: string;
  documents: string[];
  messages: any[];
  created_at: string;
  updated_at: string;
}

export default function CompaniesPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoLoadingStates, setLogoLoadingStates] = useState<Record<string, boolean>>({});
  const [uploadLoading, setUploadLoading] = useState(false);

  // Upload form state
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function fetchCompanyLogo(company: Company): Promise<string | null> {
    try {
      setLogoLoadingStates(prev => ({ ...prev, [company.id]: true }));

      const params = new URLSearchParams();
      if (company.website) {
        const domain = company.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        params.append('domain', domain);
      } else {
        params.append('domain', company.slug);
      }

      const response = await fetch(`/api/companies/logos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        return data.logo || null;
      }
    } catch (error) {
      console.warn(`Failed to fetch logo for ${company.name}:`, error);
    } finally {
      setLogoLoadingStates(prev => ({ ...prev, [company.id]: false }));
    }
    return null;
  }

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const response = await fetch('/api/companies');

        if (!response.ok) {
          throw new Error(`Failed to fetch companies: ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        const companiesWithLogos = await Promise.all(
          data.map(async (company: Company) => {
            const logo = await fetchCompanyLogo(company);
            return { ...company, logo };
          })
        );

        setCompanies(companiesWithLogos);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleUpload() {
    if (!selectedFile || !companyName.trim()) {
      // Show error message
      return;
    }

    setUploadLoading(true);
    try {
      // Create conversation first
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 'anonymous',
          company_name: companyName,
          company_description: companyDescription,
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error('Failed to create conversation');
      }

      const conversation: Conversation = await conversationResponse.json();

      // Upload file to conversation
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('company_name', companyName);
      if (companyDescription) {
        formData.append('company_description', companyDescription);
      }

      const uploadResponse = await fetch(`/api/conversations/${conversation.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Failed to upload document';

        if (uploadResponse.status === 400) {
          // Show error message
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      const uploadResult = await uploadResponse.json();

      // Navigate to the conversation
      router.push(`/q/${conversation.id}`);

      // Reset form
      setCompanyName("");
      setCompanyDescription("");
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
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

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">Loading Companies...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text fontSize="lg" color="red.500">Error Loading Companies</Text>
          <Text color="gray.600">{error}</Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Box maxW="7xl" mx="auto" px={6} py={4}>
          <HStack justify="space-between">
            <Box>
              <Heading size="lg">Search Companies</Heading>
              <Text color="gray.600" mt={2}>
                Browse thousands of companies and analyze their legal documents with AI
              </Text>
            </Box>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={() => onOpen()}
              >
                <FiPlus style={{ marginRight: '8px' }} />
                Upload My Own Documents
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut()}
              >
                <FiLogOut style={{ marginRight: '8px' }} />
                Sign Out
              </Button>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Search Section */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        <Box maxW="2xl" mx="auto">
          <InputGroup size="lg">
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1}>
              <FiSearch color="gray.400" />
            </Box>
            <Input
              placeholder="Search companies by name, description, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              borderColor="gray.300"
              _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
              pl={10}
            />
          </InputGroup>
        </Box>
      </Box>

      {/* Companies Grid */}
      <Box maxW="7xl" mx="auto" px={6} pb={8}>
        <Box mb={6}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            {filteredCompanies.length} Companies Found
          </Text>
        </Box>

        {filteredCompanies.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500">No companies found</Text>
            <Text color="gray.400">Try adjusting your search terms</Text>
          </Box>
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
            {filteredCompanies
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((company) => (
                <GridItem key={company.id}>
                  <Box
                    bg="white"
                    p={6}
                    borderRadius="lg"
                    shadow="sm"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
                    onClick={() => router.push(`/q/${company.slug}`)}
                  >
                    <VStack spacing={4} align="center">
                      {/* Company Logo */}
                      <Box position="relative" w="16" h="16">
                        {logoLoadingStates[company.id] ? (
                          <Box
                            w="16"
                            h="16"
                            bg="gray.200"
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Spinner size="sm" />
                          </Box>
                        ) : company.logo ? (
                          <Image
                            src={company.logo}
                            alt={`${company.name} logo`}
                            w="16"
                            h="16"
                            borderRadius="xl"
                            objectFit="contain"
                            bg="white"
                            border="1px"
                            borderColor="gray.200"
                          />
                        ) : (
                          <Box
                            w="16"
                            h="16"
                            bg="blue.500"
                            borderRadius="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="bold"
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </Box>
                        )}
                      </Box>

                      <VStack spacing={2} align="center">
                        <Heading size="md" textAlign="center">
                          {company.name}
                        </Heading>
                        {company.description && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            textAlign="center"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            display="-webkit-box"
                            css={{
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical"
                            }}
                          >
                            {company.description}
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </Box>
                </GridItem>
              ))}
          </Grid>
        )}
      </Box>

      {/* Upload Modal */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
          onClick={() => onClose()}
        >
          <Box
            bg="white"
            borderRadius="lg"
            shadow="xl"
            p={6}
            w="lg"
            maxW="lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Heading size="md" mb={4}>Upload Your Own Documents</Heading>
            <VStack spacing={6}>
              <Box w="full">
                <Text fontWeight="semibold" mb={2}>Company Name *</Text>
                <Input
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Box>

              <Box w="full">
                <Text fontWeight="semibold" mb={2}>Company Description (Optional)</Text>
                <Textarea
                  placeholder="Brief description of the company"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={3}
                />
              </Box>

              <Box w="full">
                <Text fontWeight="semibold" mb={2}>Upload Document *</Text>
                <Box
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: "blue.500" }}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <VStack spacing={3}>
                    <FiUpload size={24} color="gray.400" />
                    <Text color="gray.600">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      PDF, DOC, DOCX, TXT files supported
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Only legal documents will be processed
                    </Text>
                  </VStack>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </Box>
                {selectedFile && (
                  <HStack mt={2} justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Selected: {selectedFile.name}
                    </Text>
                    <IconButton
                      size="sm"
                      aria-label="Remove file"
                      onClick={() => setSelectedFile(null)}
                    >
                      <FiX />
                    </IconButton>
                  </HStack>
                )}
              </Box>
            </VStack>

            <HStack spacing={3} mt={6} justify="flex-end">
              <Button variant="ghost" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleUpload}
                isLoading={uploadLoading}
                loadingText="Uploading..."
              >
                Upload & Start Conversation
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
