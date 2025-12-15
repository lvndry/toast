"use client";

import { cn } from "@/lib/utils";

export interface TypographyProps {
  children?: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  className?: string;
  [key: string]: any;
}

export function Typography(props: TypographyProps) {
  const { children, variant = "body", className, ...rest } = props;

  switch (variant) {
    case "h1":
      return (
        <h1 className={cn("text-4xl font-bold", className)} {...rest}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 className={cn("text-3xl font-bold", className)} {...rest}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 className={cn("text-2xl font-semibold", className)} {...rest}>
          {children}
        </h3>
      );
    case "caption":
      return (
        <p className={cn("text-sm text-muted-foreground", className)} {...rest}>
          {children}
        </p>
      );
    default:
      return (
        <p className={cn("text-base", className)} {...rest}>
          {children}
        </p>
      );
  }
}

// Keep Paragraph export for backward compatibility
export interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function Paragraph({ children, className, ...props }: ParagraphProps) {
  return (
    <p className={cn("text-base text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}
