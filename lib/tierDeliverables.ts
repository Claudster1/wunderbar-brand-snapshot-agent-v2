import type { ProductTier, ActivationPlanSectionId } from "@/components/results/tabConfig";

export type DownloadDeliverableId =
  | "snapshot-report"
  | "executive-summary"
  | "prompt-guide"
  | "brand-strategy"
  | "icp-conversion-snapshot"
  | "icp-conversion-intelligence-framework"
  | "brand-standards"
  | "brand-standards-internal"
  | "brand-standards-external"
  | "brand-standards-vendor-spec"
  | "sales-battle-cards"
  | "activation-plan"
  | "digital-marketing-strategy"
  | "competitive-intelligence-brief"
  | "activation-schedule"
  | "voice-checklist"
  | "brand-playbook"
  | "strategic-action-plan"
  | "one-page-messaging"
  | "role-pack-leadership"
  | "role-pack-marketing"
  | "role-pack-sales"
  | "role-pack-design";

type TierDeliverables = {
  downloadsTabEnabled: boolean;
  activationSections: readonly ActivationPlanSectionId[];
  downloadDeliverables: readonly DownloadDeliverableId[];
};

export const TIER_DELIVERABLES: Record<ProductTier, TierDeliverables> = {
  snapshot: {
    downloadsTabEnabled: true,
    activationSections: [],
    downloadDeliverables: ["snapshot-report"],
  },
  "snapshot-plus": {
    downloadsTabEnabled: true,
    activationSections: [
      "journey-orchestration",
      "email-lifecycle",
      "seo-aeo",
      "thought-leadership",
      "paid-ads",
      "execution-roadmap",
    ],
    downloadDeliverables: ["snapshot-report", "executive-summary", "prompt-guide"],
  },
  blueprint: {
    downloadsTabEnabled: true,
    activationSections: [
      "audience-segments",
      "journey-orchestration",
      "competitive-motion-plan",
      "email-lifecycle",
      "seo-aeo",
      "paid-ads",
      "thought-leadership",
      "pr-plan",
      "execution-roadmap",
    ],
    downloadDeliverables: [
      "snapshot-report",
      "executive-summary",
      "prompt-guide",
      "brand-strategy",
      "icp-conversion-snapshot",
      "brand-standards-external",
      "brand-standards-vendor-spec",
      "one-page-messaging",
      "voice-checklist",
      "brand-playbook",
      "activation-schedule",
    ],
  },
  "blueprint-plus": {
    downloadsTabEnabled: true,
    activationSections: [
      "audience-segments",
      "journey-orchestration",
      "competitive-motion-plan",
      "lead-magnet-planning",
      "email-lifecycle",
      "seo-aeo",
      "paid-ads",
      "thought-leadership",
      "pr-plan",
      "execution-roadmap",
    ],
    downloadDeliverables: [
      "snapshot-report",
      "executive-summary",
      "prompt-guide",
      "brand-strategy",
      "icp-conversion-snapshot",
      "icp-conversion-intelligence-framework",
      "brand-standards-internal",
      "brand-standards-external",
      "brand-standards-vendor-spec",
      "sales-battle-cards",
      "activation-plan",
      "digital-marketing-strategy",
      "competitive-intelligence-brief",
      "activation-schedule",
      "voice-checklist",
      "brand-playbook",
      "strategic-action-plan",
      "one-page-messaging",
      "role-pack-leadership",
      "role-pack-marketing",
      "role-pack-sales",
      "role-pack-design",
    ],
  },
};

export function getActivationDownloadsHint(tier: ProductTier): string {
  if (tier === "snapshot-plus") {
    return "Included in Downloads for Snapshot+: Snapshot+ Report PDF, Executive Summary, and Prompt Guide.";
  }
  if (tier === "blueprint-plus") {
    return "Included in Downloads: Activation Plan PDF, Digital Marketing Strategy, Competitive Intelligence Brief, Strategic Action Plan, Activation Schedule, and role-based packs.";
  }
  if (tier === "blueprint") {
    return "Included in Downloads: Activation Schedule plus core strategy and standards PDFs. Blueprint+ adds fuller activation plan exports, competitive briefs, strategic action plan, and role packs—same Strategy depth; the upgrade is heavier execution deliverables.";
  }
  return "Included in Downloads: Activation Schedule plus your core strategy/playbook PDFs.";
}
