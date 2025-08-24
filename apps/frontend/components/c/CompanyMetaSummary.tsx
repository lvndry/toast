"use client";

import { Box, Button, Grid, GridItem, Heading, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { useState } from "react";
import MarkdownRenderer from "../markdown/markdown-renderer";

export interface MetaSummaryData {
  summary: string;
  scores: Record<string, { score: number; justification: string; }>;
  keypoints: string[];
}

interface CompanyMetaSummaryProps {
  metaSummary: MetaSummaryData;
}

export default function CompanyMetaSummary({ metaSummary }: CompanyMetaSummaryProps) {
  const [showAllKeyPoints, setShowAllKeyPoints] = useState(false);
  const [expandedScores, setExpandedScores] = useState<Set<string>>(new Set());

  const cardBg = useColorModeValue("white", "gray.800");

  function toggleScoreExpansion(scoreKey: string) {
    setExpandedScores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scoreKey)) newSet.delete(scoreKey); else newSet.add(scoreKey);
      return newSet;
    });
  }

  return (
    <Box p={6}>
      <Box maxW="7xl" mx="auto">
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

        <Grid templateColumns="1fr" gap={8}>
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
                <Button size="sm" variant="ghost" onClick={() => setShowAllKeyPoints(!showAllKeyPoints)} mt={4}>
                  {showAllKeyPoints ? 'Show Less' : `Show All ${metaSummary.keypoints.length} Points`}
                </Button>
              )}
            </Box>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Summary</Heading>
            <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
              <Box color="gray.700">
                <MarkdownRenderer>{metaSummary.summary}</MarkdownRenderer>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
