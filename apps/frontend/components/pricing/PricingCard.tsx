"use client";

import { Check } from "lucide-react";

import { useCheckout } from "@/hooks/useCheckout";
import type { UserTier } from "@/types/user";

export interface PricingTier {
  name: string;
  tier: UserTier;
  price: number;
  annualPrice: number;
  description: string;
  features: string[];
  isRecommended?: boolean;
  priceIdMonthly: string;
  priceIdAnnual: string;
  cta: string;
}

interface PricingCardProps {
  tier: PricingTier;
  billingPeriod: "monthly" | "annual";
  currentTier?: UserTier;
}

export function PricingCard({
  tier,
  billingPeriod,
  currentTier,
}: PricingCardProps) {
  const { startCheckout, isLoading } = useCheckout();

  const price = billingPeriod === "monthly" ? tier.price : tier.annualPrice;
  const priceId =
    billingPeriod === "monthly" ? tier.priceIdMonthly : tier.priceIdAnnual;
  const isCurrentPlan = currentTier === tier.tier;
  const isFree = tier.tier === "free";

  function handleUpgrade() {
    if (isFree || isCurrentPlan) return;
    startCheckout(priceId);
  }

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:shadow-xl ${
        tier.isRecommended
          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      {tier.isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tier.name}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {tier.description}
        </p>
      </div>

      <div className="mb-6">
        {isFree ? (
          <div className="flex items-baseline">
            <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
              Free
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
              ${price}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              /{billingPeriod === "monthly" ? "month" : "year"}
            </span>
          </div>
        )}
        {!isFree && billingPeriod === "annual" && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            Save ${(tier.price * 12 - tier.annualPrice).toFixed(0)} per year (
            {Math.round(
              ((tier.price * 12 - tier.annualPrice) / (tier.price * 12)) * 100,
            )}
            % off)
          </p>
        )}
      </div>

      <ul className="mb-8 space-y-4">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-green-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={isLoading || isCurrentPlan || isFree}
        className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
          tier.isRecommended
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400"
            : "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isLoading
          ? "Processing..."
          : isCurrentPlan
            ? "Current Plan"
            : tier.cta}
      </button>
    </div>
  );
}
