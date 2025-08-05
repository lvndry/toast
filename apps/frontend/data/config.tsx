import { Link } from "@chakra-ui/react";
import { NextSeoProps } from "next-seo";
import { FaGithub, FaTwitter } from "react-icons/fa";
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
        label: "Sign In",
        href: "/sign-in",
      },
      {
        label: "Sign Up",
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
        href: "https://x.com/lvndry",
        label: <FaTwitter size="14" />,
      },
      {
        href: "https://github.com/lvndry",
        label: <FaGithub size="14" />,
      },
    ],
  },
  signup: {
    title: "Terms of service made easy",
    features: [
      {
        icon: FiCheck,
        title: "Accessible",
        description: "All components strictly follow WAI-ARIA standards.",
      },
      {
        icon: FiCheck,
        title: "Themable",
        description:
          "Fully customize all components to your brand with theme support and style props.",
      },
      {
        icon: FiCheck,
        title: "Composable",
        description:
          "Compose components to fit your needs and mix them together to create new ones.",
      },
      {
        icon: FiCheck,
        title: "Productive",
        description:
          "Designed to reduce boilerplate and fully typed, build your product at speed.",
      },
    ],
  },
};

export default siteConfig;
