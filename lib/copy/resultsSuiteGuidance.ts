import type { ProductTier, ResultsTab } from "@/components/results/tabConfig";

/**
 * Tier-aware “how to use” and tab intros so the Suite reads as a linear path:
 * Results → Foundation → Strategy → (Brand Standards) → Activation → Workbook ↔ Downloads.
 */

export function getHowToUseBannerSegments(
  tier: ProductTier,
  productName: string,
): { lead: string; path: string; habits: string } {
  const habits =
    "Reference before external communication. Share sections with agencies and contractors. Review quarterly when business fundamentals change—not for trends alone.";

  switch (tier) {
    case "snapshot":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Suggested path: stay on Results and work through each section in order. When you upgrade to Snapshot+, you unlock Foundation (brand canon), Strategy (decisions and priorities), Activation (channel playbooks), and Workbook to capture edits.",
        habits,
      };
    case "snapshot-plus":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Suggested path: (1) Results — what the diagnostic says. (2) Foundation — story, positioning, messaging, and voice in depth. (3) Strategy — scannable platform, ICP, journey, channels, and priorities. (4) Activation — plans and roadmap. Refine in Workbook as you go; Blueprint adds Brand Standards and Downloads.",
        habits,
      };
    case "blueprint":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Suggested path: Results → Foundation → Strategy → Brand Standards (pre-publish QA) → Activation (ship). Keep Workbook updated as you refine; generate PDFs and schedules from Downloads when stakeholders need files.",
        habits,
      };
    case "blueprint-plus":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Suggested path: Results → Foundation → Strategy → Brand Standards → Activation. Use Workbook for ongoing edits, then Downloads for full exports, activation assets, and role packs when teams are ready to execute.",
        habits,
      };
  }
}

export function getSuiteTabIntro(
  tier: ProductTier,
  tab: ResultsTab,
): { eyebrow: string; title: string; guidance: string } {
  switch (tab) {
    case "results":
      return {
        eyebrow: "Results",
        title: "Diagnostic results and priority focus",
        guidance:
          tier === "snapshot"
            ? "Work top to bottom. This is your complete Snapshot readout—upgrade when you are ready for Foundation, Strategy, Activation, and Workbook."
            : tier === "snapshot-plus"
              ? "Start here. Then open Foundation for brand canon, Strategy for GTM decisions and priorities, and Activation for channel plans. Capture changes in Workbook as you read."
              : tier === "blueprint"
                ? "Start here, then Foundation → Strategy → Brand Standards → Activation. Refresh Workbook along the way; Downloads packages PDFs after you generate."
                : "Start here, then Foundation → Strategy → Brand Standards → Activation. Refine in Workbook; use Downloads for exports and role packs when rollout is ready.",
      };
    case "foundation":
      return {
        eyebrow: "Foundation",
        title: "Brand and messaging canon",
        guidance:
          tier === "snapshot-plus"
            ? "Long-form truth: identity, positioning, messaging, voice, and visual direction. For briefing-ready summaries and priorities, continue to Strategy next."
            : tier === "blueprint" || tier === "blueprint-plus"
              ? "Canon lives here; Strategy compresses it into decisions. Brand Standards adds publish-ready checks before Activation."
              : "Long-form brand reference—upgrade to unlock this tab with Snapshot+.",
      };
    case "strategy":
      return {
        eyebrow: "Strategy",
        title: "Strategic planning system",
        guidance:
          tier === "snapshot"
            ? "Upgrade to Snapshot+ for this tab."
            : tier === "snapshot-plus"
              ? "Decisions and platform view after Foundation: pillars, voice, ICP, journey, channels, spend, and priorities. Then open Activation—or Brand Standards first on Blueprint."
              : "After Foundation, use this for GTM decisions; Blueprint tiers add Persona Atlas and competitive depth. Then Brand Standards, then Activation.",
      };
    case "standards":
      return {
        eyebrow: "Brand Standards",
        title: "Voice, messaging, and visual standards",
        guidance:
          "Publishing QA after Strategy: do/don’t checks before anything goes live. Then Activation to assign owners and ship.",
      };
    case "activation":
      return {
        eyebrow: "Activation",
        title: "Channel activation and execution",
        guidance:
          tier === "snapshot-plus"
            ? "Channel plans and roadmap after Strategy. On Blueprint, treat Brand Standards as the step before this when you need governance first."
            : "Run channels after Strategy and Brand Standards: owners, milestones, and export-ready schedules.",
      };
    case "workbook":
      return {
        eyebrow: "Workbook",
        title: "Refinement and versioning",
        guidance:
          "Edit alongside Foundation through Activation. Workbook-linked documents in Downloads use the latest saved content when you generate.",
      };
    case "downloads":
      return {
        eyebrow: "Downloads",
        title: "Deliverables and exports",
        guidance:
          tier === "blueprint-plus"
            ? "Final packaging step: generate after Workbook reflects your decisions—bundle and role packs when every stakeholder has what they need."
            : "Generate PDFs and schedules after Workbook updates for linked documents. Regenerate when the product shows stale exports.",
      };
  }
}

/** One-line linear hint for tabs that render their own hero (not Results/Foundation shell cards). */
export function getSuiteProgressHint(tier: ProductTier, tab: Exclude<ResultsTab, "results" | "foundation">): string {
  switch (tab) {
    case "strategy":
      if (tier === "snapshot") return "";
      return "In the Suite path: after Foundation (canon), use this tab for decisions—pillars, audience, journey, channels, and execution priorities.";
    case "standards":
      return "In the Suite path: after Strategy, lock publishing rules here before Activation.";
    case "activation":
      if (tier === "snapshot-plus") {
        return "In the Suite path: after Strategy, turn priorities into channel plans and milestones (Blueprint: consider Brand Standards first).";
      }
      return "In the Suite path: after Brand Standards, assign owners and ship using the sections below.";
    case "workbook":
      return "In the Suite path: edit in parallel while you read Foundation–Activation; Downloads pull latest Workbook content when you generate.";
    case "downloads":
      if (tier === "snapshot" || tier === "snapshot-plus") return "";
      return "In the Suite path: generate exports last, once Workbook-linked sections match what you want on paper.";
    default:
      return "";
  }
}

/** Shown under the chips title on tabs that use section jump navigation (TabPageWithSidebar). */
export const TAB_SECTION_NAV_HINT =
  "Click any section to scroll there—the left sidebar lists the same shortcuts.";

/** Same as above when there is no sidebar (Results / Foundation tab shells). */
export const TAB_SECTION_NAV_HINT_CHIPS_ONLY = "Click any section to scroll there.";
