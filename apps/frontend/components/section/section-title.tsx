"use client";

import {
  Box,
  Heading,
  VStack,
} from "@chakra-ui/react";

export interface SectionTitleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  variant?: string;
}

export function SectionTitle(props: SectionTitleProps) {
  const { title, description, align, ...rest } = props;

  return (
    <VStack
      alignItems={align === "left" ? "flex-start" : "center"}
      gap={4}
      {...rest}
    >
      <Heading
        as="h2"
        size="xl"
        fontWeight="bold"
        textAlign={align}
      >
        {title}
      </Heading>
      {description && (
        <Box
          textAlign={align}
          color="gray.600"
          fontSize="lg"
          maxW="2xl"
        >
          {description}
        </Box>
      )}
    </VStack>
  );
}
