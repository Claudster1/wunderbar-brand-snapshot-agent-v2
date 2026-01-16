// lib/blueprint/ctaCopy.ts
// Blueprint CTA copy for each pillar

import { PillarKey } from "@/lib/pillars/pillarCopy";

export const BLUEPRINT_CTA_COPY: Record<PillarKey, {
  headline: (business: string) => string;
  body: (business: string) => string;
}> = {
  positioning: {
    headline: (b) => `Turn ${b}'s positioning into a scalable brand system`,
    body: (b) =>
      `Snapshot+™ clarified what makes ${b} distinct. Blueprint™ locks that positioning into messaging, structure, and decisions so it holds as you grow.`,
  },
  messaging: {
    headline: (b) => `Make ${b}'s messaging consistent everywhere`,
    body: (b) =>
      `Snapshot+™ surfaced where your messaging breaks down. Blueprint™ creates a single source of truth you can actually use.`,
  },
  visibility: {
    headline: (b) => `Turn visibility into sustained demand for ${b}`,
    body: (b) =>
      `Snapshot+™ identified visibility gaps. Blueprint™ builds a system so your brand shows up clearly — across search, AI, and content.`,
  },
  credibility: {
    headline: (b) => `Strengthen trust signals across ${b}`,
    body: (b) =>
      `Snapshot+™ highlighted where credibility could be reinforced. Blueprint™ ensures your brand earns trust at every touchpoint.`,
  },
  conversion: {
    headline: (b) => `Turn clarity into conversion for ${b}`,
    body: (b) =>
      `Snapshot+™ showed where clarity isn't translating into action. Blueprint™ aligns your brand so the right customers move forward.`,
  },
};
