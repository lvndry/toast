"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export interface HighlightProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  [key: string]: any;
}

export function Highlight(props: HighlightProps) {
  const { title, description, icon, ...rest } = props;

  return (
    <VStack
      align="flex-start"
      p={6}
      bg="white"
      borderRadius="lg"
      shadow="md"
      gap={4}
      border="1px"
      borderColor="gray.200"
      transition="all 0.2s ease"
      _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
      {...rest}
    >
      {icon && <Box>{icon}</Box>}
      <VStack align="flex-start" gap={2}>
        <Heading size="md" fontWeight="semibold">
          {title}
        </Heading>
        {description && (
          <Text color="gray.600" fontSize="sm">
            {description}
          </Text>
        )}
      </VStack>
    </VStack>
  );
}
