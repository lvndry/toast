const pricing = {
  title: "Pricing for every legal team",
  description: "Choose the plan that fits your legal document analysis needs.",
  plans: [
    {
      id: "free",
      title: "Free",
      description: "Perfect for individual researchers and small teams.",
      price: "Free",
      features: [
        {
          title: "100 company searches per month",
          dynamicKey: "monthly_limit",
        },
        {
          title: "Basic legal document analysis",
        },
        {
          title: "AI assistant questions",
        },
        {
          title: "Legal summaries",
        },
        {
          title: "Terms of service analysis",
        },
        {
          title: "Privacy policy insights",
        },
        {
          title: "Standard support",
        },
      ],
      action: {
        href: "/sign-up",
      },
    },
    {
      id: "business",
      title: "Pro",
      description: "For growing legal teams and professionals.",
      price: "$29",
      pricePeriod: "/month",
      isRecommended: true,
      features: [
        {
          title: "100 company searches per month", // This will be replaced dynamically
          dynamicKey: "monthly_limit",
        },
        {
          title: "Advanced legal analysis",
        },
        {
          title: "Unlimited AI assistant questions",
        },
        {
          title: "Document comparison tools",
        },
        {
          title: "Compliance checking",
        },
        {
          title: "Risk assessment",
        },
        {
          title: "Export reports",
        },
        {
          title: "Priority support",
        },
        {
          title: "API access",
          iconColor: "green.500",
        },
      ],
      action: {
        href: "/sign-up",
      },
    },
    {
      id: "enterprise",
      title: "Enterprise",
      description: "For large legal teams and organizations.",
      price: "$99",
      pricePeriod: "/month",
      features: [
        {
          title: "Unlimited company searches", // This will be replaced dynamically
          dynamicKey: "monthly_limit",
        },
        {
          title: "Full legal document analysis",
        },
        {
          title: "Custom AI training",
        },
        {
          title: "Team collaboration",
        },
        {
          title: "Advanced compliance tools",
        },
        {
          title: "White-label options",
        },
        {
          title: "Dedicated support",
        },
        {
          title: "Custom integrations",
        },
        {
          title: "SLA guarantee",
          iconColor: "green.500",
        },
      ],
      action: {
        href: "/sign-up",
      },
    },
  ],
};

export default pricing;
