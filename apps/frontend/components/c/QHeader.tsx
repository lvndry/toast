"use client";

import { Box, Button, HStack, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

interface ConversationMeta {
  id: string;
  pinned?: boolean;
  archived?: boolean;
}

interface QHeaderProps {
  title: string;
  subtitle?: string;
  conversation?: ConversationMeta | null;
  onBack: () => void;
  onUploadClick?: () => void;
  onDeleteClick?: () => void;
  onTogglePinned?: () => void;
  onToggleArchived?: () => void;
  uploadLoading?: boolean;
  onToggleSummarySidebar?: () => void;
  isSummarySidebarOpen?: boolean;
}

export default function QHeader({
  title,
  subtitle,
  conversation,
  onBack,
  onUploadClick,
  onDeleteClick,
  onTogglePinned,
  onToggleArchived,
  uploadLoading,
  onToggleSummarySidebar,
  isSummarySidebarOpen
}: QHeaderProps) {
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box bg={cardBg} shadow="sm" borderBottom="1px" borderColor="gray.200" flexShrink={0}>
      <Box maxW="7xl" mx="auto" px={6} py={4}>
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">{title}</Heading>
            {subtitle && (
              <Text color="gray.600" mt={1}>{subtitle}</Text>
            )}
            {conversation && (
              <HStack spacing={2} mt={2}>
                <Button
                  size="xs"
                  variant={conversation.pinned ? "solid" : "outline"}
                  onClick={onTogglePinned}
                >
                  {conversation.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  size="xs"
                  variant={conversation.archived ? "solid" : "outline"}
                  onClick={onToggleArchived}
                >
                  {conversation.archived ? "Unarchive" : "Archive"}
                </Button>
              </HStack>
            )}
          </Box>
          <HStack spacing={3}>
            {conversation && onToggleSummarySidebar && (
              <Button
                size="sm"
                variant={isSummarySidebarOpen ? "solid" : "outline"}
                onClick={onToggleSummarySidebar}
              >
                {isSummarySidebarOpen ? "Hide Summary" : "Show Summary"}
              </Button>
            )}
            {conversation && onUploadClick && (
              <Button
                size="sm"
                variant="outline"
                onClick={onUploadClick}
                isLoading={uploadLoading}
                loadingText="Uploading..."
              >
                <FiUpload style={{ marginRight: '8px' }} />
                Upload More Documents
              </Button>
            )}
            {conversation && onDeleteClick && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={onDeleteClick}
              >
                Delete
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onBack}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Back
            </Button>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}
