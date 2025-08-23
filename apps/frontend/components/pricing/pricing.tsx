"use client";

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export interface PricingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  price: React.ReactNode;
  features?: React.ReactNode[];
  action?: React.ReactNode;
  [key: string]: any;
}

export function Pricing(props: PricingProps) {
  const { title, description, price, features, action, ...rest } = props;

  return (
    <VStack
      p={8}
      bg="white"
      borderRadius="lg"
      shadow="md"
      border="1px"
      borderColor="gray.200"
      gap={6}
      {...rest}
    >
      <VStack gap={4}>
        <Heading size="lg" textAlign="center">
          {title}
        </Heading>
        {description && (
          <Text color="gray.600" textAlign="center">
            {description}
          </Text>
        )}
        <Text fontSize="3xl" fontWeight="bold">
          {price}
        </Text>
      </VStack>

      {features && features.length > 0 && (
        <VStack gap={3} align="flex-start" w="full">
          {features.map((feature, index) => (
            <Text key={index} fontSize="sm">
              {feature}
            </Text>
          ))}
        </VStack>
      )}

      {action && <Box w="full">{action}</Box>}
    </VStack>
  );
}
