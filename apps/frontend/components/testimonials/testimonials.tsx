"use client";

import { cn } from "@/lib/utils";

export interface TestimonialsProps {
  children?: React.ReactNode;
  columns?: number | number[];
  [key: string]: any;
}

export function Testimonials(props: TestimonialsProps) {
  const { children, columns, className, ...rest } = props;

  return (
    <div className={cn("flex flex-col gap-8", className)} {...rest}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
}
