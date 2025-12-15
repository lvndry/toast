"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TestimonialProps {
  name: string;
  description?: React.ReactNode;
  avatar?: string;
  [key: string]: any;
}

export function Testimonial(props: TestimonialProps) {
  const { name, description, avatar, className, ...rest } = props;

  return (
    <div
      className={cn(
        "p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col gap-4 items-center text-center",
        className,
      )}
      {...rest}
    >
      {avatar && (
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
