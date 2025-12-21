"use client";

import { AlertTriangle, Zap } from "lucide-react";

import { useCheckout } from "@/hooks/useCheckout";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usagePercentage: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  usagePercentage,
}: UpgradeModalProps) {
  const { startCheckout, isLoading } = useCheckout();

  if (!isOpen) return null;

  function handleUpgrade() {
    // Use Individual monthly price ID from environment
    const priceId =
      process.env.NEXT_PUBLIC_PADDLE_PRICE_INDIVIDUAL_MONTHLY || "";
    startCheckout(priceId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 p-4 dark:from-purple-900/30 dark:to-pink-900/30">
            {usagePercentage >= 100 ? (
              <AlertTriangle className="h-10 w-10 text-red-500" />
            ) : (
              <Zap className="h-10 w-10 text-yellow-500" />
            )}
          </div>
        </div>

        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {usagePercentage >= 100
            ? "You've Reached Your Limit"
            : "Almost at Your Limit!"}
        </h2>

        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          {usagePercentage >= 100
            ? "You've used all 3 free analyses this month. Upgrade to Individual for unlimited privacy policy analysis."
            : `You've used ${usagePercentage}% of your free analyses. Upgrade now for unlimited access and premium features.`}
        </p>

        <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:from-purple-950/30 dark:to-pink-950/30">
          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Individual Plan - $9/month
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              Unlimited analyses
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              Full reports with citations
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              Comparison tools
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Upgrade Now"}
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Maybe Later
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Cancel anytime. 14-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
