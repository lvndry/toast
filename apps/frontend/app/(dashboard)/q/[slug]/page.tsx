"use client";

import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack
} from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiSend, FiUpload, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

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
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MetaSummary {
  summary: string;
  scores: Record<string, { score: number; justification: string; }>;
  keypoints: string[];
}

export default function QPage({ params }: { params: Promise<{ slug: string; }>; }) {
  const { slug } = use(params);
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [company, setCompany] = useState<Company | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaSummary, setMetaSummary] = useState<MetaSummary | null>(null);
  const [showAllKeyPoints, setShowAllKeyPoints] = useState(false);
  const [expandedScores, setExpandedScores] = useState<Set<string>>(new Set());
  const [uploadLoading, setUploadLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Function to scroll to bottom
  function scrollToBottom() {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when loading state changes
  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [loading]);

  useEffect(() => {
    async function fetchData() {
      try {
        setInitialLoading(true);

        // Check if this is a conversation ID (UUID format) or company slug
        const isConversationId = /^[a-zA-Z0-9]{22}$/.test(slug);

        if (isConversationId) {
          // Fetch conversation
          const conversationResponse = await fetch(`/api/conversations/${slug}`);
          if (!conversationResponse.ok) {
            throw new Error("Conversation not found");
          }
          const conversationData: Conversation = await conversationResponse.json();
          setConversation(conversationData);
          setMessages(conversationData.messages || []);
        } else {
          // Fetch company data
          const companyResponse = await fetch(`/api/companies/${slug}`);
          if (!companyResponse.ok) {
            throw new Error("Company not found");
          }
          const companyData: Company = await companyResponse.json();
          setCompany(companyData);

          // Fetch meta summary
          const metaResponse = await fetch(`/api/meta-summary/${slug}`);
          if (metaResponse.ok) {
            const metaData: MetaSummary = await metaResponse.json();
            setMetaSummary(metaData);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setInitialLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  async function handleSendMessage() {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      if (conversation) {
        // Send message to conversation
        const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: inputValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.ai_message.content,
          role: "assistant",
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else if (company) {
        // Send message to company
        const response = await fetch("/api/q", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: inputValue,
            company_slug: company.slug
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.answer,
          role: "assistant",
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function toggleScoreExpansion(scoreKey: string) {
    setExpandedScores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scoreKey)) {
        newSet.delete(scoreKey);
      } else {
        newSet.add(scoreKey);
      }
      return newSet;
    });
  }

  async function handleFileUpload(file: File) {
    if (!conversation) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_name', conversation.company_name);
      if (conversation.company_description) {
        formData.append('company_description', conversation.company_description);
      }

      const uploadResponse = await fetch(`/api/conversations/${conversation.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Failed to upload document';

        // Removed toast as per edit hint
        return;
      }

      const uploadResult = await uploadResponse.json();

      // Removed toast as per edit hint

      // Refresh the conversation to get updated data
      const conversationResponse = await fetch(`/api/conversations/${conversation.id}`);
      if (conversationResponse.ok) {
        const updatedConversation = await conversationResponse.json();
        setConversation(updatedConversation);
        setMessages(updatedConversation.messages || []);
      }

      onClose(); // Close modal after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      // Removed toast as per edit hint
    } finally {
      setUploadLoading(false);
    }
  }

  if (error) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center" p={6}>
        <Box maxW="md" w="full" bg={cardBg} p={6} borderRadius="lg" shadow="md">
          <VStack spacing={4} textAlign="center">
            <Box w="16" h="16" bg="red.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
              <FiX size={24} color="red.500" />
            </Box>
            <Heading size="md" color="red.500">Oops! Something went wrong</Heading>
            <Text color="gray.600">{error}</Text>
            <Button onClick={() => router.back()}>Go Back</Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (initialLoading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  const displayName = conversation?.company_name || company?.name;
  const displayDescription = conversation?.company_description || company?.description;

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      {/* Header */}
      <Box bg={cardBg} shadow="sm" borderBottom="1px" borderColor="gray.200" flexShrink={0}>
        <Box maxW="7xl" mx="auto" px={6} py={4}>
          <HStack justify="space-between">
            <Box>
              <Heading size="lg">{displayName}</Heading>
              <Text color="gray.600" mt={1}>
                {conversation ? "Document Analysis & Chat" : "Privacy Analysis & Chat"}
              </Text>
            </Box>
            <HStack spacing={3}>
              {conversation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpen()}
                  isLoading={uploadLoading}
                  loadingText="Uploading..."
                >
                  <FiUpload style={{ marginRight: '8px' }} />
                  Upload More Documents
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.back()}
              >
                <FiArrowLeft style={{ marginRight: '8px' }} />
                Back
              </Button>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex="1" overflowY="auto" ref={chatContainerRef}>
        {/* Meta Summary for Companies */}
        {metaSummary && company && (
          <Box p={6}>
            <Box maxW="7xl" mx="auto">
              {/* Scores Section */}
              <Box mb={8}>
                <Heading size="md" mb={4}>Privacy Analysis Scores</Heading>
                <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                  {Object.entries(metaSummary.scores).map(([key, score]) => {
                    const isExpanded = expandedScores.has(key);
                    return (
                      <GridItem key={key}>
                        <Box
                          bg={cardBg}
                          p={6}
                          borderRadius="lg"
                          shadow="sm"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                          onClick={() => toggleScoreExpansion(key)}
                        >
                          <VStack spacing={3}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                              {score.score}/10
                            </Text>
                            {isExpanded && (
                              <Text fontSize="sm" color="gray.600" textAlign="center">
                                {score.justification}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      </GridItem>
                    );
                  })}
                </Grid>
              </Box>

              {/* Key Points and Summary */}
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                <Box>
                  <Heading size="md" mb={4}>Key Points</Heading>
                  <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                    <VStack spacing={3} align="stretch">
                      {(showAllKeyPoints ? metaSummary.keypoints : metaSummary.keypoints.slice(0, 5)).map((point, index) => (
                        <HStack key={index} align="start" spacing={3}>
                          <Box w="2" h="2" bg="blue.500" borderRadius="full" mt={2} flexShrink={0} />
                          <Text fontSize="sm" color="gray.700">{point}</Text>
                        </HStack>
                      ))}
                    </VStack>
                    {metaSummary.keypoints.length > 5 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAllKeyPoints(!showAllKeyPoints)}
                        mt={4}
                      >
                        {showAllKeyPoints ? 'Show Less' : `Show All ${metaSummary.keypoints.length} Points`}
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={4}>Summary</Heading>
                  <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                    <Box color="gray.700">
                      <ReactMarkdown>{metaSummary.summary}</ReactMarkdown>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Chat Messages */}
        <Box p={6}>
          <Box maxW="4xl" mx="auto">
            {messages.length === 0 && !loading && (
              <Box textAlign="center" py={12}>
                <VStack spacing={4}>
                  <Box w="20" h="20" bg="blue.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <FiSend size={24} color="blue.500" />
                  </Box>
                  <Heading size="md">Start a conversation</Heading>
                  <Text color="gray.600">
                    Ask about privacy practices, data collection, user rights, and more
                  </Text>
                </VStack>
              </Box>
            )}

            {messages.map((message) => (
              <Box
                key={message.id}
                mb={4}
                display="flex"
                justifyContent={message.role === "user" ? "flex-end" : "flex-start"}
              >
                <Box
                  maxW="70%"
                  bg={message.role === "user" ? "blue.500" : cardBg}
                  color={message.role === "user" ? "white" : "gray.800"}
                  p={4}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Text fontSize="sm">{message.content}</Text>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box display="flex" justifyContent="flex-start" mb={4}>
                <Box bg={cardBg} p={4} borderRadius="lg" shadow="sm">
                  <HStack spacing={3}>
                    <HStack gap={1}>
                      <Box w="2" h="2" bg="blue.500" borderRadius="full" animation="bounce 1s infinite" />
                      <Box w="2" h="2" bg="blue.500" borderRadius="full" animation="bounce 1s infinite" style={{ animationDelay: '0.1s' }} />
                      <Box w="2" h="2" bg="blue.500" borderRadius="full" animation="bounce 1s infinite" style={{ animationDelay: '0.2s' }} />
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium">Thinking...</Text>
                  </HStack>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Chat Input */}
      <Box bg={cardBg} borderTop="1px" borderColor="gray.200" p={4} flexShrink={0}>
        <Box maxW="4xl" mx="auto">
          <HStack spacing={3}>
            <Input
              placeholder="Ask about privacy practices, data collection, user rights..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              size="lg"
            />
            <Button
              colorScheme="blue"
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              size="lg"
            >
              <FiSend />
            </Button>
          </HStack>
        </Box>
      </Box>

      {/* Upload Modal for Conversations */}
      {conversation && isOpen && (
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
            bg={cardBg}
            borderRadius="lg"
            shadow="xl"
            p={6}
            w="md"
            maxW="md"
            boxShadow="lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Heading size="md" mb={4}>Upload Additional Documents</Heading>
            <VStack spacing={4}>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={6}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "blue.500" }}
                onClick={() => document.getElementById('file-upload-modal')?.click()}
              >
                <VStack spacing={3}>
                  <FiUpload size={24} color="gray.400" />
                  <Text color="gray.600">Click to upload or drag and drop</Text>
                  <Text fontSize="sm" color="gray.500">
                    PDF, DOC, DOCX, TXT files supported
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Only legal documents will be processed
                  </Text>
                </VStack>
                <input
                  id="file-upload-modal"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
              </Box>
            </VStack>
            <HStack spacing={3} mt={6} justify="flex-end">
              <Button variant="ghost" onClick={() => onClose()}>
                Cancel
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
