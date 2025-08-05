"use client";

import { Features } from "@components/features";
import { FiBookOpen, FiCheck, FiCode, FiFlag, FiGrid, FiSearch, FiShield, FiSmile, FiThumbsUp, FiTrendingUp } from "react-icons/fi";
import { Link } from "@chakra-ui/react";

export default function FeaturesSection() {
  return (
    <Features
      id="features"
      title={
        <>Not your standard<br /> dashboard template.</>
      }
      description={
        <>
          Saas UI Pro includes everything you need to build modern frontends.<br />
          Use it as a template for your next product or foundation for your design system.
        </>
      }
      align="left"
      columns={[1, 2, 3]}
      iconSize={4}
      features={[
        {
          title: "Instant Search.",
          icon: FiSearch,
          description:
            "Search thousands of companies and get instant legal document analysis in seconds, not hours.",
          variant: "inline",
        },
        {
          title: "Pre-analyzed Database.",
          icon: FiShield,
          description:
            "Our AI has already analyzed legal documents from thousands of websites for you - no manual work required.",
          variant: "inline",
        },
        {
          title: "AI Assistant.",
          icon: FiSmile,
          description:
            "Ask follow-up questions and get detailed explanations about any legal terms or complex clauses.",
          variant: "inline",
        },
        {
          title: "Legal Summaries.",
          icon: FiBookOpen,
          description:
            "Get clear, jargon-free summaries of complex legal agreements and understand what they mean for you.",
          variant: "inline",
        },
        {
          title: "Company Research.",
          icon: FiTrendingUp,
          description:
            "Compare legal documents across companies and understand industry standards and best practices.",
          variant: "inline",
        },
        {
          title: "Compliance Checking.",
          icon: FiCheck,
          description:
            "Quickly identify compliance issues and regulatory requirements across different jurisdictions.",
          variant: "inline",
        },
        {
          title: "Document Comparison.",
          icon: FiGrid,
          description:
            "Compare terms of service and privacy policies across multiple companies side by side.",
          variant: "inline",
        },
        {
          title: "Risk Assessment.",
          icon: FiFlag,
          description:
            "Identify potential legal risks and red flags in contracts and agreements with AI-powered analysis.",
          variant: "inline",
        },
        {
          title: "Legal Questions.",
          icon: FiCode,
          description: (
            <>
              Ask specific legal questions and get detailed answers about any aspect of {" "}
              <Link href="/companies">legal documents</Link>, powered by advanced AI analysis.
            </>
          ),
          variant: "inline",
        },
      ]}
    />
  );
}