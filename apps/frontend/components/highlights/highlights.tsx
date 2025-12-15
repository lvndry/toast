"use client";

import { cn } from "@/lib/utils";

export interface HighlightProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  [key: string]: any;
}

export function Highlight(props: HighlightProps) {
  const { title, description, icon, className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md gap-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
      {...rest}
    >
      {icon && <div>{icon}</div>}
      <div className="flex flex-col gap-2 items-start">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
