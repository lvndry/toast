"use client";

import {
  Box,
  Heading,
  StackProps,
  VStack,
  useMultiStyleConfig,
} from "@chakra-ui/react";

export interface SectionTitleProps extends Omit<StackProps, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  variant?: string;
}

export function SectionTitle(props: SectionTitleProps) {
  const { title, description, align, variant, ...rest } = props;
  const styles = useMultiStyleConfig("SectionTitle", { variant });

  return (
    <VStack
      sx={styles.wrapper}
      alignItems={align === "left" ? "flex-start" : "center"}
      spacing={4}
      {...rest}
    >
      <Heading sx={styles.title} as="h2">
        {title}
      </Heading>
      {description && (
        <Box sx={styles.description} textAlign={align}>
          {description}
        </Box>
      )}
    </VStack>
  );
}
