"use client";

import {
  Button,
  Row,
  Text
} from "@once-ui-system/core";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <Row
      as="header"
      padding="m"
      horizontal="space-between"
      align="center"
    >
      {/* Logo */}
      <Link href="/">
        <Image
          src="/toastai-no-bg.png"
          alt="ToastAI Logo"
          width={65}
          height={60}
          objectFit="contain"
          onError={(e) => {
            // Fallback to emoji if PNG fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "4px",
          background: "#F4A261",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #E76F51",
          position: "absolute",
          top: 0,
          left: 0
        }}>
          <span style={{ fontSize: "16px" }}>🍞</span>
        </div>
      </Link>

      {/* Navigation */}
      <Row gap="m" vertical="center">
        {/* Navigation Links */}
        <Row gap="m" align="center">
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
        </Row>

        {/* CTA Button */}
        <Button
          size="m"
          weight="strong"
          href="/companies"
        >
          Get Started
        </Button>
      </Row>
    </Row>
  );
}
