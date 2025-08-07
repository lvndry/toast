"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  Button,
  Text
} from "@once-ui-system/core";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header
      className="p-4 flex justify-between items-center"
    >
      <div className="flex gap-4 items-center">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/toastai-no-bg.png"
            alt="ToastAI Logo"
            width={65}
            height={60}
            className="object-contain"
            onError={(e) => {
              // Fallback to emoji if PNG fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-8 h-8 rounded absolute top-0 left-0 bg-[#F4A261] border-2 border-[#E76F51] hidden items-center justify-center">
            <span style={{ fontSize: "16px" }}>🍞</span>
          </div>
        </Link>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
        </Text>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 items-center">
        {/* Navigation Links */}
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-decoration-none">
            <Text variant="body-default-m" onBackground="neutral-weak" style={{ cursor: "pointer" }}>
              Home
            </Text>
          </Link>
          <Link href="/pricing" className="text-decoration-none">
            <Text variant="body-default-m" onBackground="neutral-weak" style={{ cursor: "pointer" }}>
              Pricing
            </Text>
          </Link>
          {isSignedIn && <Link href="/profile" className="text-decoration-none">
            <Text variant="body-default-m" onBackground="neutral-weak" style={{ cursor: "pointer" }}>
              Profile
            </Text>
          </Link>}
        </div>

        {/* Auth Buttons */}
        {isSignedIn ? (
          <div className="flex gap-4 items-center">
            <Button
              size="m"
              weight="strong"
              href="/companies"
            >
              Go to App
            </Button>
            <SignOutButton>
              <Button
                size="m"
                variant="secondary"
              >
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <SignInButton mode="modal">
              <Button
                size="m"
                variant="secondary"
              >
                Login
              </Button>
            </SignInButton>
            <Button
              size="m"
              weight="strong"
              href="/companies"
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
