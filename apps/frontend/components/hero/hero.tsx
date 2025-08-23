"use client";

import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";

export interface HeroProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  image?: React.ReactNode;
  [key: string]: any;
}

export function Hero(props: HeroProps) {
  const { title, description, action, image, ...rest } = props;

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      align="center"
      justify="space-between"
      gap={8}
      {...rest}
    >
      <VStack align="flex-start" flex="1" gap={6}>
        <Heading size="2xl" fontWeight="bold">
          {title}
        </Heading>
        {description && (
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            {description}
          </Text>
        )}
        {action && <Box>{action}</Box>}
      </VStack>
      {image && <Box flex="1">{image}</Box>}
    </Flex>
  );
}
