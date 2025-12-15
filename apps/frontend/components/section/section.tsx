"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  innerWidth?: string;
  className?: string;
}

export function Section(props: SectionProps) {
  const { children, innerWidth, className, ...rest } = props;

  return (
    <section className={cn("py-12", className)} {...rest}>
      <div className={cn("container mx-auto px-4", innerWidth || "max-w-7xl")}>
        {children}
      </div>
    </section>
  );
}
