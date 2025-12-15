import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  [key: string]: any;
}

export function ButtonLink({
  href,
  children,
  variant,
  size,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className="no-underline">
      <Button variant={variant} size={size} className={className} {...props}>
        {children}
      </Button>
    </Link>
  );
}
