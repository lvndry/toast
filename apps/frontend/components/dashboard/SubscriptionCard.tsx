"use client";

import { Calendar, CreditCard, TrendingUp } from "lucide-react";

import { useEffect, useState } from "react";

import { useBillingPortal } from "@/hooks/useBillingPortal";
import {
  type SubscriptionResponse,
  subscriptionApi,
} from "@/lib/api/subscriptions";

export function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { openPortal, isLoading: isPortalLoading } = useBillingPortal();

  useEffect(() => {
    subscriptionApi
      .getSubscription()
      .then(setSubscription)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          Loading subscription...
        </p>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const tierDisplayNames: Record<string, string> = {
    free: "Free",
    individual: "Individual",
    business: "Business",
    enterprise: "Enterprise",
  };

  const statusColors: Record<string, string> = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    past_due:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    paused: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
  };

  const isPaidTier = subscription.tier !== "free";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subscription
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusColors[subscription.status] || statusColors.inactive
          }`}
        >
          {subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1)}
        </span>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Plan
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {tierDisplayNames[subscription.tier] || subscription.tier}
            </p>
          </div>
        </div>

        {subscription.current_period_end && (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subscription.status === "canceled"
                  ? "Active Until"
                  : "Renews On"}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {isPaidTier && subscription.paddle_customer_id && (
        <button
          onClick={openPortal}
          disabled={isPortalLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          <CreditCard className="h-5 w-5" />
          {isPortalLoading ? "Opening..." : "Manage Subscription"}
        </button>
      )}

      {subscription.tier === "free" && (
        <a
          href="/pricing"
          className="block rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-center font-semibold text-white transition-colors hover:from-purple-700 hover:to-pink-700"
        >
          Upgrade Plan
        </a>
      )}
    </div>
  );
}
