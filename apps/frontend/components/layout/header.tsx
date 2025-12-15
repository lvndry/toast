"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import siteConfig from "@data/config";
import { useAuthStatus } from "@hooks/useAuthStatus";

import { Logo } from "./logo";

export interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function Header(props: HeaderProps) {
  const { children, className, ...rest } = props;
  const { isSignedIn, isLoading } = useAuthStatus();

  const defaultNav = (
    <div className="flex items-center gap-6">
      {siteConfig.header?.links?.map((item: any) => {
        const href = item.id ? `/#${item.id}` : item.href;
        const isPrimary = item.variant === "primary";
        if (isPrimary) {
          return (
            <Link key={item.label} href={href}>
              <Button size="sm">{item.label}</Button>
            </Link>
          );
        }
        return (
          <Link
            key={item.label ?? href}
            href={href}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  const authenticatedNav = (
    <div className="flex items-center gap-6">
      <Link href="/companies">
        <Button size="sm">Go to App</Button>
      </Link>
    </div>
  );

  return (
    <header
      className={cn("bg-background border-b border-border", className)}
      {...rest}
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <div className="flex items-center gap-6">
            {children ??
              (!isLoading && isSignedIn ? authenticatedNav : defaultNav)}
          </div>
        </div>
      </div>
    </header>
  );
}
