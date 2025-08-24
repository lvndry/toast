"use client";

import { Box, Button, Grid, GridItem, Heading, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";

export interface ConversationCard {
  id: string;
  title?: string | null;
  company_name: string;
  updated_at: string;
  last_message_at?: string | null;
  message_count?: number;
  messages?: { id: string; }[];
  pinned?: boolean;
  archived?: boolean;
}

interface ConversationsListProps {
  companyName: string;
  conversations: ConversationCard[];
  onOpenConversation: (id: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onRename: (id: string, newName: string) => void;
  onTogglePinned: (id: string, newVal: boolean) => void;
  onToggleArchived: (id: string, newVal: boolean) => void;
  onDelete: (id: string) => void;
  isRefreshing?: boolean;
}

export default function ConversationsList({
  companyName,
  conversations,
  onOpenConversation,
  onRefresh,
  onCreate,
  onRename,
  onTogglePinned,
  onToggleArchived,
  onDelete,
  isRefreshing
}: ConversationsListProps) {
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box p={6}>
      <Box maxW="7xl" mx="auto">
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Your Conversations</Heading>
          <HStack>
            <Button size="sm" variant="outline" onClick={onRefresh} isLoading={isRefreshing}>Refresh</Button>
            <Button size="sm" colorScheme="blue" onClick={onCreate}>Ask questions to {companyName} documents</Button>
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
          {conversations.map((c) => (
            <GridItem key={c.id}>
              <Box
                bg={cardBg}
                p={4}
                borderRadius="lg"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Heading size="sm" noOfLines={1}>{c.title || c.company_name}</Heading>
                    <HStack spacing={2}>
                      <Button size="xs" variant={c.pinned ? "solid" : "outline"} onClick={() => onTogglePinned(c.id, !c.pinned)}>
                        {c.pinned ? "Unpin" : "Pin"}
                      </Button>
                      <Button size="xs" variant={c.archived ? "solid" : "outline"} onClick={() => onToggleArchived(c.id, !c.archived)}>
                        {c.archived ? "Unarchive" : "Archive"}
                      </Button>
                    </HStack>
                  </HStack>
                  <HStack spacing={3}>
                    <Button size="sm" onClick={() => onOpenConversation(c.id)}>Open</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const newName = window.prompt("Rename conversation", c.title || "");
                        if (newName !== null) onRename(c.id, newName);
                      }}
                    >
                      Rename
                    </Button>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => onDelete(c.id)}>Delete</Button>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Updated {new Date(c.last_message_at || c.updated_at).toLocaleString()} • {c.message_count || c.messages?.length || 0} messages
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          ))}

          {conversations.length === 0 && !isRefreshing && (
            <GridItem>
              <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm" textAlign="center">
                <VStack spacing={3}>
                  <Heading size="sm">No conversations yet</Heading>
                  <Text color="gray.600">Create your first conversation for {companyName}</Text>
                  <Button size="sm" colorScheme="blue" onClick={onCreate}>Ask questions to {companyName} documents</Button>
                </VStack>
              </Box>
            </GridItem>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
