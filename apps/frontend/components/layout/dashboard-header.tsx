"use client";

import NextLink from "next/link";

import { Button } from "@/components/ui/button";
import { useClerk, useUser } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Logo } from "./logo";

export interface DashboardHeaderProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function DashboardHeader(props: DashboardHeaderProps) {
  const { children, ...rest } = props;
  const { user } = useUser();
  const { signOut } = useClerk();

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="font-medium">
          {user?.firstName || user?.emailAddresses[0]?.emailAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <NextLink href="/profile">Profile</NextLink>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="bg-background border-b border-border" {...rest}>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <div className="flex items-center gap-6">{children ?? userMenu}</div>
        </div>
      </div>
    </header>
  );
}
