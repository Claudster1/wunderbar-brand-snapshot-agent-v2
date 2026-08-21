/** Free Snapshot — educate via suite page before purchase. */
export const RESULTS_CTA_COPY = {
  A: {
    headline: "Your Diagnostic Identified a Clear Path to Stronger Brand Performance",
    body:
      "See how Snapshot+™, Blueprint™, and Blueprint+™ build on these results — compare what’s included, then choose the path that fits how you want to grow.",
    primaryCta: "Explore the WunderBrand Suite™",
  },
  B: {
    headline: "Turn This Diagnostic into a System Your Brand Can Activate",
    body:
      "Your results show where to focus first. Explore the suite to see how Snapshot+™ and beyond expand that into strategy, messaging frameworks, and activation.",
    primaryCta: "Explore the WunderBrand Suite™",
  },
};

export type PaidUpsellTier = "snapshot-plus" | "blueprint" | "blueprint-plus";

/** Next-tier upsell for Snapshot+™ and higher (benefits + CTA). */
export const RESULTS_TIER_UPSELL: Record<
  PaidUpsellTier,
  {
    eyebrow: string;
    headline: string;
    lead: string;
    benefits: string[];
    primaryCta: string;
    /** Checkout product, or null when the CTA is services / expert */
    checkoutProduct: "blueprint" | "blueprint-plus" | null;
  }
> = {
  "snapshot-plus": {
    eyebrow: "Recommended Next Step",
    headline: "Turn Insight into a Brand System with Blueprint™",
    lead:
      "Snapshot+™ showed where to focus. Blueprint™ turns that into a complete, usable brand operating system your team can activate.",
    benefits: [
      "Positioning, messaging framework, and brand narrative in one system",
      "Voice, tone, and visual direction your team can reuse",
      "AI-ready prompts aligned to your diagnostic priorities",
      "Standards and activation guidance so execution stays consistent",
    ],
    primaryCta: "Upgrade to Blueprint™",
    checkoutProduct: "blueprint",
  },
  blueprint: {
    eyebrow: "Recommended Next Step",
    headline: "Scale Your System with Blueprint+™",
    lead:
      "Blueprint™ gave you the foundation. Blueprint+™ adds advanced strategy, audience depth, and activation tools so you can grow with precision.",
    benefits: [
      "Audience segmentation and messaging matrix for every priority segment",
      "Competitive intelligence and sales battle cards",
      "90-day activation plan and digital marketing strategy",
      "Expanded AI prompt library plus your Strategy Activation Session",
    ],
    primaryCta: "Upgrade to Blueprint+™",
    checkoutProduct: "blueprint-plus",
  },
  "blueprint-plus": {
    eyebrow: "Your Suite",
    headline: "Put Your Brand System to Work",
    lead:
      "You’re on our highest self-serve tier. When you’re ready for hands-on execution, our team can run marketing or guide AI adoption alongside your Blueprint+™.",
    benefits: [
      "Managed Marketing — strategy, content, and campaigns aligned to your brand",
      "AI Consulting — brand-safe workflows and implementation at scale",
      "Strategy Activation Session — already included with Blueprint+™",
    ],
    primaryCta: "Talk to an Expert",
    checkoutProduct: null,
  },
};
