"use client";

import { cn } from "@/lib/utils";

export interface PricingProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  price: React.ReactNode;
  features?: React.ReactNode[];
  action?: React.ReactNode;
  [key: string]: any;
}

export function Pricing(props: PricingProps) {
  const { title, description, price, features, action, className, ...rest } =
    props;

  return (
    <div
      className={cn(
        "p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col gap-6",
        className,
      )}
      {...rest}
    >
      <div className="flex flex-col gap-4 text-center">
        <h3 className="text-xl font-bold">{title}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        )}
        <div className="text-3xl font-bold">{price}</div>
      </div>

      {features && features.length > 0 && (
        <div className="flex flex-col gap-3 items-start w-full">
          {features.map((feature, index) => (
            <p key={index} className="text-sm">
              {feature}
            </p>
          ))}
        </div>
      )}

      {action && <div className="w-full">{action}</div>}
    </div>
  );
}
