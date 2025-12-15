"use client";

import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  variant?: string;
  className?: string;
}

export function SectionTitle(props: SectionTitleProps) {
  const { title, description, align = "center", className, ...rest } = props;

  const alignClass =
    align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div
      className={cn("flex flex-col gap-4 py-4", alignClass, className)}
      {...rest}
    >
      <h2
        className={cn(
          "text-3xl md:text-4xl font-bold",
          align === "center" && "text-center",
        )}
      >
        {title}
      </h2>
      {description && (
        <div
          className={cn(
            "text-lg text-muted-foreground max-w-2xl",
            align === "center" && "text-center",
          )}
        >
          {description}
        </div>
      )}
    </div>
  );
}
