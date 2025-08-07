import { Link } from "@chakra-ui/react";
import { NextSeoProps } from "next-seo";
import { FaGithub } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";

import { Logo } from "./logo";

const siteConfig = {
  logo: Logo,
  seo: {
    title: "Toast AI",
    description: "The AI-powered legal document analysis tool",
  } as NextSeoProps,
  termsUrl: "#",
  privacyUrl: "#",
  header: {
    links: [
      {
        id: "features",
        label: "Features",
      },
      {
        id: "pricing",
        label: "Pricing",
      },
      {
        id: "faq",
        label: "FAQ",
      },
      {
        label: "Login",
        href: "/sign-in",
      },
      {
        label: "Sign up",
        href: "/sign-up",
        variant: "primary",
      },
    ],
  },
  footer: {
    copyright: (
      <>
        Built by{" "}
        <Link href="https://github.com/lvndry">lvndry</Link>
      </>
    ),
    links: [
      {
        href: "mailto:lvndry@proton.me",
        label: "Contact",
      },
      {
        href: "https://github.com/lvndry",
        label: <FaGithub size="14" />,
      },
    ],
  },
  signup: {
    title: "AI-powered legal document analysis",
    features: [
      {
        icon: FiCheck,
        title: "Smart Analysis",
        description: "AI-powered extraction and analysis of legal documents with high accuracy.",
      },
      {
        icon: FiCheck,
        title: "PDF Processing",
        description:
          "Upload your legal documents and let our AI analyze them for you.",
      },
      {
        icon: FiCheck,
        title: "Company Intelligence",
        description:
          "Build comprehensive company profiles with extracted legal information and insights.",
      },
      {
        icon: FiCheck,
        title: "Secure & Compliant",
        description:
          "Enterprise-grade security with data encryption and compliance with legal standards.",
      },
    ],
  },
};

export default siteConfig;
