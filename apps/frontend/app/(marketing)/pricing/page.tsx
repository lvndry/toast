"use client";

import { useState } from "react";

import {
  PricingCard,
  type PricingTier,
} from "@/components/pricing/PricingCard";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

// TODO: Replace these with actual Paddle Price IDs from environment variables
const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    tier: "free",
    price: 0,
    annualPrice: 0,
    description: "Perfect for trying out Toast AI with basic privacy analysis.",
    features: [
      "3 analyses per month",
      "Basic verdict & risk score",
      "Top 3 findings per analysis",
      "Evidence strength indicators",
    ],
    priceIdMonthly: "",
    priceIdAnnual: "",
    cta: "Get Started Free",
  },
  {
    name: "Individual",
    tier: "individual",
    price: 9,
    annualPrice: 84,
    description:
      "For privacy-conscious individuals who want unlimited analysis.",
    features: [
      "Unlimited analyses",
      "Full reports with citations",
      "Comparison tools",
      "Email alerts",
      "Priority email support",
    ],
    isRecommended: true,
    priceIdMonthly:
      process.env.NEXT_PUBLIC_PADDLE_PRICE_INDIVIDUAL_MONTHLY || "pri_01",
    priceIdAnnual:
      process.env.NEXT_PUBLIC_PADDLE_PRICE_INDIVIDUAL_ANNUAL || "pri_02",
    cta: "Upgrade to Individual",
  },
  {
    name: "Business",
    tier: "business",
    price: 49,
    annualPrice: 468,
    description: "For growing legal teams and small businesses.",
    features: [
      "Everything in Individual",
      "Vendor dashboard",
      "Policy change monitoring",
      "Exportable reports",
      "Team sharing (up to 5 members)",
      "Priority support",
    ],
    priceIdMonthly:
      process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS_MONTHLY || "pri_03",
    priceIdAnnual:
      process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS_ANNUAL || "pri_04",
    cta: "Upgrade to Business",
  },
  {
    name: "Enterprise",
    tier: "enterprise",
    price: 500,
    annualPrice: 5000,
    description: "For large legal teams and organizations with advanced needs.",
    features: [
      "Everything in Business",
      "Unlimited team members",
      "SSO (SAML/OIDC)",
      "Custom compliance policies",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    priceIdMonthly: "",
    priceIdAnnual: "",
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly",
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-extrabold text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that's right for you. Upgrade, downgrade, or cancel
            anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-md px-8 py-3 font-semibold transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`relative rounded-md px-8 py-3 font-semibold transition-colors ${
                billingPeriod === "annual"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Annual
              <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.tier}
              tier={tier}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <PricingFAQ />
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          All prices are in USD. VAT may be applicable depending on your
          location.
          <br />
          Payments are processed securely by Paddle.
        </p>
      </div>
    </div>
  );
}
