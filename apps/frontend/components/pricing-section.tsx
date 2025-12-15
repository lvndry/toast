import { ButtonLink } from "@/components/button-link/button-link";
import { Pricing } from "@/components/pricing/pricing";
import pricing from "@/data/pricing";
import { cn } from "@/lib/utils";

export function PricingSection({
  onGetStartedClick,
}: {
  onGetStartedClick: (planId: string) => void;
}) {
  return (
    <div className="py-24">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-4xl font-bold">{pricing.title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {pricing.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {pricing.plans.map((plan) => (
              <div key={plan.id} className="relative group">
                {plan.isRecommended ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-xs font-semibold bg-purple-500 text-white px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                ) : null}
                <Pricing
                  title={plan.title}
                  description={plan.description}
                  price={`${plan.price}${plan.pricePeriod ? ` ${plan.pricePeriod}` : ""}`}
                  features={plan.features.map((f) => f.title)}
                  className={cn(
                    "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
                    plan.isRecommended
                      ? "border-purple-500 shadow-xl"
                      : "border-gray-200",
                  )}
                  action={
                    <ButtonLink
                      href={plan.action.href}
                      variant={plan.isRecommended ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        plan.isRecommended
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "",
                      )}
                      onClick={() => onGetStartedClick(plan.id)}
                    >
                      Get Started
                    </ButtonLink>
                  }
                />
              </div>
            ))}
          </div>

          <p className="p-8 text-center text-gray-500 dark:text-gray-400">
            Free tier includes 10 company searches per month. VAT may be
            applicable depending on your location.
          </p>
        </div>
      </div>
    </div>
  );
}
