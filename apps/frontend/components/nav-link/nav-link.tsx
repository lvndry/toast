import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  display?: string[];
  className?: string;
  [key: string]: any;
}

export function NavLink({
  href,
  children,
  isActive,
  display,
  className,
  ...props
}: NavLinkProps) {
  // Handle display array like ["none", null, "block"] -> responsive classes
  let displayClasses = "";
  if (display) {
    displayClasses = cn(
      display[0] === "none" && "hidden",
      display[2] === "block" && "md:inline-flex",
    );
  }

  return (
    <Link
      href={href}
      className={cn("no-underline", displayClasses, className)}
      {...props}
    >
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        className={cn(isActive && "bg-primary text-primary-foreground")}
      >
        {children}
      </Button>
    </Link>
  );
}
