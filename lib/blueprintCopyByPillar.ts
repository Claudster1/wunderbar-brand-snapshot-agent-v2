// lib/blueprintCopyByPillar.ts
// Pillar-specific copy for Blueprint™ CTAs and messaging

export type PillarKey =
  | "positioning"
  | "messaging"
  | "visibility"
  | "credibility"
  | "conversion";

export const blueprintCopyByPillar: Record<
  PillarKey,
  { headline: string; body: string }
> = {
  positioning: {
    headline: "Turn clarity into a clear market position",
    body:
      "Your Snapshot+™ highlighted positioning as your primary focus area. Blueprint™ translates that insight into a precise positioning system you can use across messaging, content, and campaigns."
  },
  messaging: {
    headline: "Create messaging that stays consistent as you grow",
    body:
      "Your Snapshot+™ showed opportunities to sharpen and align your messaging. Blueprint™ gives you a unified messaging framework so your brand sounds intentional everywhere."
  },
  visibility: {
    headline: "Make your brand easier to find — and easier to choose",
    body:
      "Visibility emerged as a priority in your Snapshot+™. Blueprint™ builds a structured approach across SEO, AEO, and channels so your brand shows up with authority."
  },
  credibility: {
    headline: "Strengthen trust at every brand touchpoint",
    body:
      "Your Snapshot+™ surfaced credibility as an opportunity. Blueprint™ turns trust signals into a cohesive system that reinforces confidence across your brand."
  },
  conversion: {
    headline: "Turn attention into action",
    body:
      "Your Snapshot+™ identified conversion as an area to refine. Blueprint™ aligns messaging, structure, and flow to support clearer decisions."
  }
};
