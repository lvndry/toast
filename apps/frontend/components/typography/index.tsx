"use client";

import { Text } from "@chakra-ui/react";

export interface TypographyProps {
  children?: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  [key: string]: any;
}

export function Typography(props: TypographyProps) {
  const { children, variant = "body", ...rest } = props;

  function getTextProps() {
    switch (variant) {
      case "h1":
        return { fontSize: "4xl", fontWeight: "bold", as: "h1" as const };
      case "h2":
        return { fontSize: "3xl", fontWeight: "bold", as: "h2" as const };
      case "h3":
        return { fontSize: "2xl", fontWeight: "semibold", as: "h3" as const };
      case "caption":
        return { fontSize: "sm", color: "gray.500" };
      default:
        return { fontSize: "md" };
    }
  };

  return <Text {...getTextProps()} {...rest}>{children}</Text>;
}
