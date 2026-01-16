// src/content/blueprintActivation.copy.ts
// Blueprint activation copy for each pillar

import { PillarKey } from "@/types/pillars";

export const blueprintActivationCopy: Record<
  PillarKey,
  {
    headline: string;
    value: string;
    outcome: string;
  }
> = {
  positioning: {
    headline: "Clarifies your market position",
    value:
      "Your Snapshot+™ revealed that positioning is your biggest opportunity. Blueprint™ translates that insight into a clear positioning system you can rally around.",
    outcome:
      "Your brand becomes easier to understand, easier to choose, and harder to confuse.",
  },

  messaging: {
    headline: "Aligns what you say everywhere",
    value:
      "Snapshot+™ identified messaging as a key lever. Blueprint™ turns that into a structured messaging framework you can reuse across every channel.",
    outcome:
      "Your message stays consistent without sounding repetitive or scripted.",
  },

  visibility: {
    headline: "Strengthens how your brand shows up",
    value:
      "Snapshot+™ highlighted visibility as a growth opportunity. Blueprint™ defines how your brand appears across channels — including SEO and AEO.",
    outcome:
      "Your brand becomes easier to find, recognize, and recommend.",
  },

  credibility: {
    headline: "Builds trust through consistency",
    value:
      "Snapshot+™ showed credibility as a priority. Blueprint™ establishes clear brand rules so your presence feels intentional and trustworthy.",
    outcome:
      "Your brand earns confidence faster — even with new audiences.",
  },

  conversion: {
    headline: "Turns clarity into action",
    value:
      "Snapshot+™ revealed conversion gaps. Blueprint™ connects positioning and messaging directly to decision-making moments.",
    outcome:
      "More people understand what to do next — and why it matters.",
  },
};
