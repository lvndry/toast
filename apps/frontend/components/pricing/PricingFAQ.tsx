"use client";

import { ChevronDown } from "lucide-react";

import { useState } from "react";

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period, and you won't be charged again.",
  },
  {
    question: "What happens when I hit the free tier limit?",
    answer:
      "When you reach 3 analyses in the free tier, you'll see an upgrade prompt. You can upgrade to Individual for unlimited analyses or wait until the next month when your limit resets.",
  },
  {
    question: "Do you offer annual discounts?",
    answer:
      "Yes! Annual billing gives you 20% off compared to monthly billing. Individual is $84/year ($7/month effective) and Business is $468/year ($39/month effective).",
  },
  {
    question: "What's included in the Enterprise plan?",
    answer:
      "Enterprise includes unlimited team members, SSO (SAML/OIDC), custom compliance policies, API access, priority support, and dedicated account management. Contact us for custom pricing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our payment processor, Paddle. All payments are secure and encrypted.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade or downgrade at any time from your billing portal. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 14 days of purchase for a full refund.",
  },
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
