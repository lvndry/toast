"use client";

import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

import { use, useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import CompanyDocumentsList from "@components/c/CompanyDocumentsList";
import CompanyMetaSummary from "@components/c/CompanyMetaSummary";
import ConversationsList from "@components/c/ConversationsList";
import QHeader from "@components/c/QHeader";
import UploadModal from "@components/c/UploadModal";
import ChatInput from "@components/chat/chat-input";
import { useAnalytics } from "@hooks/useAnalytics";

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
  company_slug?: string;
  company_description?: string;
  documents: string[];
  messages: Message[];
  title?: string | null;
  mode?: "qa" | "summary" | "compliance" | "custom";
  archived?: boolean;
  pinned?: boolean;
  tags?: string[];
  message_count?: number;
  last_message_at?: string | null;
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
  scores: Record<string, { score: number; justification: string }>;
  keypoints: string[];
}

interface Document {
  id: string;
  url: string;
  title: string | null;
  doc_type: string;
  company_id: string;
  created_at: string;
}

export default function QPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useUser();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSummaryOpen,
    onOpen: onSummaryOpen,
    onClose: onSummaryClose,
  } = useDisclosure();
  const { trackUserJourney, trackPageView } = useAnalytics();

  const [company, setCompany] = useState<Company | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaSummary, setMetaSummary] = useState<MetaSummary | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>(
    [],
  );
  const [convosLoading, setConvosLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Function to scroll to bottom
  function scrollToBottom() {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
          const conversationResponse = await fetch(
            `/api/conversations/${slug}`,
          );
          if (!conversationResponse.ok) {
            throw new Error("Conversation not found");
          }
          const conversationData: Conversation =
            await conversationResponse.json();
          setConversation(conversationData);
          setMessages(conversationData.messages || []);

          // Track conversation view
          trackUserJourney.conversationStarted(
            conversationData.id,
            conversationData.company_name,
            false,
          );

          // Fetch meta summary for the conversation's company if available
          if (conversationData.company_slug) {
            try {
              const metaResponse = await fetch(
                `/api/meta-summary/${conversationData.company_slug}`,
              );
              if (metaResponse.ok) {
                const metaData: MetaSummary = await metaResponse.json();
                setMetaSummary(metaData);
              }
            } catch (_) {
              // ignore meta summary errors in conversation mode
            }
          }
        } else {
          // Fetch company data
          const companyResponse = await fetch(`/api/companies/${slug}`);
          if (!companyResponse.ok) {
            throw new Error("Company not found");
          }
          const companyData: Company = await companyResponse.json();
          setCompany(companyData);

          // Track company view
          trackUserJourney.companyViewed(companyData.slug, companyData.name);

          // Fetch meta summary
          const metaResponse = await fetch(`/api/meta-summary/${slug}`);
          if (metaResponse.ok) {
            const metaData: MetaSummary = await metaResponse.json();
            setMetaSummary(metaData);
          }

          // Fetch company documents
          try {
            setDocumentsLoading(true);
            const documentsResponse = await fetch(
              `/api/companies/${slug}/documents`,
            );
            if (documentsResponse.ok) {
              const documentsData: Document[] = await documentsResponse.json();
              setDocuments(documentsData);
            }
          } catch (_) {
            // ignore documents fetch errors
          } finally {
            setDocumentsLoading(false);
          }

          // Fetch user's conversations for this company
          if (user?.id) {
            try {
              setConvosLoading(true);
              const listRes = await fetch(
                `/api/conversations?user_id=${user.id}&company_slug=${companyData.slug}`,
              );
              if (listRes.ok) {
                const listData: Conversation[] = await listRes.json();
                // Sort: most recent first (last_message_at desc, fallback to updated_at)
                listData.sort((a, b) => {
                  const ad = new Date(
                    a.last_message_at || a.updated_at,
                  ).getTime();
                  const bd = new Date(
                    b.last_message_at || b.updated_at,
                  ).getTime();
                  return bd - ad;
                });
                setConversationsList(listData);
              }
            } finally {
              setConvosLoading(false);
            }
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
  }, [slug, trackUserJourney]);

  async function refreshConversationsList() {
    if (!company || !user?.id) return;
    try {
      setConvosLoading(true);
      const listRes = await fetch(
        `/api/conversations?user_id=${user.id}&company_slug=${company.slug}`,
      );
      if (listRes.ok) {
        const listData: Conversation[] = await listRes.json();
        listData.sort((a, b) => {
          const ad = new Date(a.last_message_at || a.updated_at).getTime();
          const bd = new Date(b.last_message_at || b.updated_at).getTime();
          return bd - ad;
        });
        setConversationsList(listData);
      }
    } finally {
      setConvosLoading(false);
    }
  }

  async function createConversation() {
    if (!company || !user?.id) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          company_name: company.name,
          company_slug: company.slug,
          company_description: company.description,
          title: "New Conversation",
          mode: "qa",
        }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const created: Conversation = await res.json();
      router.push(`/c/${created.id}`);
    } catch (e) {
      console.error(e);
    }
  }

  async function updateConversationMeta(
    id: string,
    data: Partial<Conversation>,
  ) {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) await refreshConversationsList();
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteConversationById(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) await refreshConversationsList();
    } catch (e) {
      console.error(e);
    }
  }

  // Track page view
  useEffect(() => {
    if (!initialLoading) {
      const pageName = conversation ? "conversation" : "company_analysis";
      trackPageView(pageName, {
        company_slug: company?.slug || conversation?.company_name,
        conversation_id: conversation?.id,
      });
    }
  }, [initialLoading, conversation, company, trackPageView]);

  async function handleSendMessage() {
    const message = inputValue.trim();
    if (!message || loading) return;

    const startTime = Date.now();
    const questionLength = inputValue.length;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    // Track question asked
    trackUserJourney.questionAsked(
      message,
      questionLength,
      conversation?.id,
      company?.slug,
    );

    try {
      if (conversation) {
        // Send message to conversation
        const response = await fetch(
          `/api/conversations/${conversation.id}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.ai_message.content,
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Track successful answer
        const responseTime = Date.now() - startTime;
        trackUserJourney.questionAnswered(
          questionLength,
          data.ai_message.content.length,
          responseTime,
          conversation.id,
        );
      } else if (company) {
        // Create a conversation on-the-fly, then send the message to it
        const createResponse = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user?.id,
            company_name: company.name,
            company_slug: company.slug,
            company_description: company.description,
            title: message.slice(0, 80),
            mode: "qa",
          }),
        });

        if (!createResponse.ok) {
          throw new Error(
            `Failed to create conversation: ${createResponse.status}`,
          );
        }

        const createdConversation: Conversation = await createResponse.json();
        setConversation(createdConversation);
        // Update URL to conversation id for resuming later
        try {
          router.replace(`/c/${createdConversation.id}`);
        } catch {}

        const sendResponse = await fetch(
          `/api/conversations/${createdConversation.id}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
            }),
          },
        );

        if (!sendResponse.ok) {
          throw new Error(`Failed to send message: ${sendResponse.status}`);
        }

        const data = await sendResponse.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.ai_message.content,
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Track successful answer
        const responseTime = Date.now() - startTime;
        trackUserJourney.questionAnswered(
          questionLength,
          data.ai_message.content.length,
          responseTime,
          createdConversation.id,
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Track failed question
      trackUserJourney.questionFailed(
        err instanceof Error ? err.message : "Unknown error",
        conversation?.id,
      );
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

  async function handleFileUpload(file: File) {
    if (!conversation) return;

    setUploadLoading(true);
    try {
      // Track upload start
      trackUserJourney.documentUploadStarted(file.type, file.size);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("company_name", conversation.company_name);
      if (conversation.company_description) {
        formData.append(
          "company_description",
          conversation.company_description,
        );
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

        // Track upload failure
        trackUserJourney.documentUploadFailed(file.type, errorMessage);

        // Removed toast as per edit hint
        return;
      }

      const uploadResult = await uploadResponse.json();

      // Track successful upload
      trackUserJourney.documentUploadCompleted(
        file.type,
        file.size,
        conversation.company_name,
      );

      // Removed toast as per edit hint

      // Refresh the conversation to get updated data
      const conversationResponse = await fetch(
        `/api/conversations/${conversation.id}`,
      );
      if (conversationResponse.ok) {
        const updatedConversation = await conversationResponse.json();
        setConversation(updatedConversation);
        setMessages(updatedConversation.messages || []);
      }

      onClose(); // Close modal after successful upload
    } catch (error) {
      console.error("Upload error:", error);
      // Track upload failure
      trackUserJourney.documentUploadFailed(
        file.type,
        error instanceof Error ? error.message : "Unknown error",
      );
      // Removed toast as per edit hint
    } finally {
      setUploadLoading(false);
    }
  }

  if (error) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={6}
      >
        <Box maxW="md" w="full" bg={cardBg} p={6} borderRadius="lg" shadow="md">
          <VStack spacing={4} textAlign="center">
            <Box
              w="16"
              h="16"
              bg="red.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiX size={24} color="red.500" />
            </Box>
            <Heading size="md" color="red.500">
              Oops! Something went wrong
            </Heading>
            <Text color="gray.600">{error}</Text>
            <Button onClick={() => router.back()}>Go Back</Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (initialLoading) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">
            Loading...
          </Text>
        </VStack>
      </Box>
    );
  }

  const displayName = conversation?.company_name || company?.name;
  const displayDescription =
    conversation?.company_description || company?.description;

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      <QHeader
        title={displayName || ""}
        subtitle={
          conversation ? "Document Analysis & Chat" : "Privacy Analysis & Chat"
        }
        conversation={
          conversation
            ? {
                id: conversation.id,
                pinned: conversation.pinned,
                archived: conversation.archived,
              }
            : null
        }
        onBack={() => router.back()}
        onUploadClick={conversation ? () => onOpen() : undefined}
        onToggleSummarySidebar={
          conversation
            ? () => (isSummaryOpen ? onSummaryClose() : onSummaryOpen())
            : undefined
        }
        isSummarySidebarOpen={conversation ? isSummaryOpen : undefined}
        onDeleteClick={
          conversation
            ? async () => {
                try {
                  await fetch(`/api/conversations/${conversation.id}`, {
                    method: "DELETE",
                  });
                  router.push(`/c/${conversation.company_slug}`);
                } catch {}
              }
            : undefined
        }
        onTogglePinned={
          conversation
            ? async () => {
                try {
                  await fetch(`/api/conversations/${conversation.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pinned: !conversation.pinned }),
                  });
                  setConversation({
                    ...conversation,
                    pinned: !conversation.pinned,
                  });
                } catch {}
              }
            : undefined
        }
        onToggleArchived={
          conversation
            ? async () => {
                try {
                  await fetch(`/api/conversations/${conversation.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ archived: !conversation.archived }),
                  });
                  setConversation({
                    ...conversation,
                    archived: !conversation.archived,
                  });
                } catch {}
              }
            : undefined
        }
        uploadLoading={uploadLoading}
      />

      {/* Main Content */}
      <Box flex="1" overflowY="auto" ref={chatContainerRef}>
        {company && (
          <ConversationsList
            companyName={company.name}
            conversations={conversationsList}
            onOpenConversation={(id) => router.push(`/c/${id}`)}
            onRefresh={refreshConversationsList}
            onCreate={createConversation}
            onRename={async (id, newName) => {
              await updateConversationMeta(id, { title: newName });
            }}
            onTogglePinned={(id, newVal) =>
              updateConversationMeta(id, { pinned: newVal })
            }
            onToggleArchived={(id, newVal) =>
              updateConversationMeta(id, { archived: newVal })
            }
            onDelete={deleteConversationById}
            isRefreshing={convosLoading}
          />
        )}

        {/* Inline meta summary only when browsing company view, not conversation */}
        {metaSummary && company && !conversation && (
          <CompanyMetaSummary metaSummary={metaSummary} />
        )}

        {/* Documents list only when browsing company view, not conversation */}
        {company && !conversation && (
          <CompanyDocumentsList documents={documents} />
        )}
      </Box>

      {/* Chat Input - only in conversation */}
      {conversation && (
        <Box
          bg={cardBg}
          borderTop="1px"
          borderColor="gray.200"
          p={4}
          flexShrink={0}
        >
          <Box maxW="4xl" mx="auto">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={loading}
              placeholder="Ask about privacy practices, data collection, user rights..."
            />
          </Box>
        </Box>
      )}

      {/* Upload Modal for Conversations */}
      {conversation && (
        <UploadModal
          isOpen={isOpen}
          onClose={onClose}
          onFileSelected={(file) => handleFileUpload(file)}
        />
      )}

      {/* Right-side Summary Drawer for conversations */}
      {conversation && (
        <Drawer
          isOpen={isSummaryOpen}
          placement="right"
          size="md"
          onClose={onSummaryClose}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Report</DrawerHeader>
            <DrawerBody>
              {metaSummary ? (
                <CompanyMetaSummary metaSummary={metaSummary} />
              ) : (
                <VStack spacing={4} mt={8}>
                  <Spinner />
                  <Text color="gray.600">Loading meta summary…</Text>
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Create Conversation Modal removed in favor of immediate create */}
    </Box>
  );
}
