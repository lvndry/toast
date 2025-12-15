"use client";

import { cn } from "@/lib/utils";

export interface HeroProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  image?: React.ReactNode;
  [key: string]: any;
}

export function Hero(props: HeroProps) {
  const { title, description, action, image, className, ...rest } = props;

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center justify-between gap-8",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col items-start flex-1 gap-6">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
      {image && <div className="flex-1 w-full">{image}</div>}
    </div>
  );
}
