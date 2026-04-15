import type { ProductTier, ResultsTab } from "@/components/results/tabConfig";

/**
 * Tier-aware “how to use” and tab intros so the Suite reads as a linear path:
 * Results → Foundation (brand bedrock) → Strategy (go-to-market plan) → (Brand Standards) → Activation (execute the plan) → Workbook ↔ Downloads.
 *
 * Copy aligns with `docs/TIER_DELIVERABLES_LOCKED.md` and the execution-ready rule in
 * `lib/copy/reportExecutionStandard.ts` (artifacts and clear outputs—not vague “do more marketing” lists).
 */

export type SuiteTabIntroOptions = {
  /** Company display name from the diagnostic—personalizes tab intros when present. */
  businessName?: string;
};

export type SuiteTabGlossaryTerm = {
  term: string;
  definition: string;
};

export type SuiteTabIntro = {
  eyebrow: string;
  title: string;
  guidance: string;
  /** Short definitions for jargon—rendered with info icons after the main paragraph. */
  glossary?: readonly SuiteTabGlossaryTerm[];
};

function forCompany(name: string | undefined, sentence: string): string {
  const n = typeof name === "string" ? name.trim() : "";
  if (!n) return sentence;
  return `For ${n}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
}

export function getHowToUseBannerSegments(
  tier: ProductTier,
  productName: string,
): { lead: string; path: string; habits: string } {
  const habits =
    "Use this as a working reference before you publish or brief partners. Revisit when your offer, audience, or channels change—not on a trend calendar alone.";

  switch (tier) {
    case "snapshot":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Read Results top to bottom (or use the section chips). Each block explains what the score means in everyday language. When you move to Snapshot+, you get the same story expanded into Foundation (who you are), Strategy (who to reach and how), Activation (how to run it), and Workbook so edits stay in one place.",
        habits,
      };
    case "snapshot-plus":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Start with Results for the headline picture, then Foundation for the brand story (positioning, pillars, people you serve, voice). Strategy turns that into a practical market plan—audiences, journey, channels, spend, and what to do first. Activation is the execution layer for this product (playbooks and timelines). Capture edits in Workbook; Brand Standards and richer exports arrive when you move to Blueprint.",
        habits,
      };
    case "blueprint":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Follow the tabs in order: Results → Foundation → Strategy (including how what you sell fits the story) → Brand Standards → Activation. Blueprint gives structured plans and schedules you can brief a team on. Blueprint+ keeps the same Strategy depth but fills Activation with more paste-ready copy and adds heavier export packs—choose the tier that matches how “done” you need assets to be.",
        habits,
      };
    case "blueprint-plus":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Same path as Blueprint: Results through Brand Standards, then Activation. Blueprint+ is built around finished artifacts—real copy blocks, channel plans, schedules, and prompts you can hand to marketing or sales—not a long chore list. Sequenced work still lives in roadmaps, but each step should name an output you can ship. Polish in Workbook, then use Downloads for bundles and role-based packs when stakeholders need files.",
        habits,
      };
  }
}

export function getSuiteTabIntro(
  tier: ProductTier,
  tab: ResultsTab,
  options?: SuiteTabIntroOptions,
): SuiteTabIntro {
  const co = options?.businessName;

  switch (tab) {
    case "results":
      return {
        eyebrow: "Results",
        title: "Diagnostic results and priority focus",
        guidance:
          tier === "snapshot"
            ? forCompany(
                co,
                "Your WunderBrand Score™ and pillar scores show where the brand is strong today and where friction shows up first. Use the chips to jump, or scroll in order. Upgrade when you want the full Suite path (Foundation → Strategy → Activation → Workbook).",
              )
            : tier === "snapshot-plus"
              ? forCompany(
                  co,
                  "Scores summarize the diagnostic; the sections below translate them into what to protect, what to fix first, and how pillars interact. Then continue in Foundation → Strategy → Activation so the story and the plan stay connected.",
                )
              : tier === "blueprint"
                ? forCompany(
                    co,
                    "Use this page as the executive read, then walk Foundation → Strategy → Brand Standards → Activation so decisions line up with your downloads.",
                  )
                : forCompany(
                    co,
                    "Use this page as the executive read, then walk Foundation → Strategy → Brand Standards → Activation. Blueprint+ pairs the same strategic depth with heavier execution artifacts—refine in Workbook before you generate final packs from Downloads.",
                  ),
        glossary: [
          {
            term: "WunderBrand Score™",
            definition:
              "A 0–100 headline score from our proprietary model. It blends the five pillar scores with weights—it is not a simple average of the 0–20 pillar numbers.",
          },
          ...(tier === "snapshot-plus" || tier === "blueprint" || tier === "blueprint-plus"
            ? ([
                {
                  term: "Context coverage",
                  definition:
                    "How much usable business context the diagnostic captured. Higher coverage usually means sharper, more specific recommendations.",
                },
              ] as const)
            : []),
        ],
      };
    case "foundation":
      return {
        eyebrow: "Foundation",
        title: "Brand foundation",
        guidance:
          tier === "snapshot-plus"
            ? forCompany(
                co,
                "This tab is your brand story in one place—how you position, what you repeat (pillars), who you serve, how you sound, and how the pieces fit. Strategy is the next step: who to prioritize in the market and how channels and spend support that story.",
              )
            : tier === "blueprint"
              ? forCompany(
                  co,
                  "Foundation is the same on Blueprint and Blueprint+: the long-form brand reference. Strategy adds the go-to-market plan, including how products or services fit the narrative.",
                )
              : tier === "blueprint-plus"
                ? forCompany(
                    co,
                    "Foundation matches Blueprint word for word on strategy inputs—the difference between tiers is not here. Blueprint+ adds depth in Activation (more ready-to-run assets) and in Downloads (more export bundles).",
                  )
                : "Upgrade to Snapshot+ to unlock Foundation—your positioning, pillars, audience, and voice in one narrative workspace.",
        glossary: [
          {
            term: "Positioning",
            definition: "The clear idea you want buyers to remember about you compared with alternatives—not a slogan, but the strategic “only we…” story.",
          },
          {
            term: "Messaging pillars",
            definition: "A small set of themes your brand should repeat so every channel reinforces the same story.",
          },
        ],
      };
    case "strategy":
      return {
        eyebrow: "Strategy",
        title: "Go-to-market plan",
        guidance:
          tier === "snapshot"
            ? "Upgrade to Snapshot+ to unlock Strategy—how you prioritize audiences, journey, channels, and spend on top of Foundation."
            : tier === "snapshot-plus"
              ? forCompany(
                  co,
                  "Strategy sits on top of Foundation: who to win first, how they decide, where to show up, how budget should move, and what to sequence before everything else. Some panels include plainer language for finance or leadership—skip them if you do not need them. Next: Activation turns this plan into channel playbooks (Brand Standards first when your product includes it).",
                )
              : tier === "blueprint"
                ? forCompany(
                    co,
                    "You will see the full plan—audiences, journey, competitive read, channels, spend, priorities—and how what you sell fits the story. Blueprint+ does not change this tab’s depth; it adds more execution-ready material under Activation and richer exports.",
                  )
                : forCompany(
                    co,
                    "Same strategic coverage as Blueprint: audiences, journey, competitive context, channels, spend, priorities, and how offers connect to the story. Blueprint+ invests more in Activation (paste-ready assets) and Downloads—not in rewriting Strategy.",
                  ),
        glossary: [
          {
            term: "Go-to-market (GTM)",
            definition: "The practical plan for reaching and winning buyers—who first, which channels, what message, and how resources move—not generic “marketing advice.”",
          },
          {
            term: "ICP",
            definition: "Ideal customer profile—the best-fit buyers you intentionally design messaging and campaigns for first.",
          },
        ],
      };
    case "standards":
      if (tier !== "blueprint" && tier !== "blueprint-plus") {
        return {
          eyebrow: "Brand Standards",
          title: "Voice, messaging, and visual standards",
          guidance: "Included with Blueprint and Blueprint+—upgrade to unlock publishing guardrails after Strategy.",
          glossary: undefined,
        };
      }
      return {
        eyebrow: "Brand Standards",
        title: "Voice, messaging, and visual standards",
        guidance:
          tier === "blueprint"
            ? forCompany(
                co,
                "After Strategy, use this tab as a publishing checkpoint: voice rules, message guardrails, and visual direction so external materials stay on-brand. Then move to Activation to assign owners and timelines.",
              )
            : forCompany(
                co,
                "Same publishing checkpoint as Blueprint, with additional internal and vendor-ready standards included in your Blueprint+ download set. Finish edits here before you generate final standards PDFs.",
              ),
        glossary: [
          {
            term: "Brand Standards",
            definition:
              "A concise rule set—voice, messaging, and visual cues—so anyone creating content can match your brand without re-reading the whole strategy.",
          },
        ],
      };
    case "activation":
      return {
        eyebrow: "Activation",
        title: tier === "blueprint-plus" ? "Execution-ready activation" : "Tactical activation",
        guidance:
          tier === "snapshot-plus"
            ? forCompany(
                co,
                "This tier includes channel playbooks, owners, milestones, and schedules tied to your Strategy—designed so a team can run the plan, not just read it. Use Brand Standards first when your product includes it, so publish checks happen before you scale creative.",
              )
            : tier === "blueprint-plus"
              ? forCompany(
                  co,
                  "Blueprint+ Activation is built around artifacts: paste-ready copy, sequences, channel playbooks, schedules, and prompts grounded in your diagnostic. Roadmaps still show order, but each block should give you something you can brief or ship—not a vague to-do list. Polish in Workbook, then package from Downloads.",
                )
              : tier === "blueprint"
                ? forCompany(
                    co,
                    "Blueprint Activation turns Strategy into structured plans, roadmaps, and schedules—clear enough to brief writers, media, and sales. Blueprint+ adds more finished copy and deeper export packs while keeping the same strategic inputs.",
                  )
                : "After Strategy and Brand Standards, use Activation to assign owners, milestones, and channel work—then export schedules when your product includes them.",
        glossary: [
          {
            term: "Activation",
            definition:
              "The execution layer of the Suite—how the strategy shows up in channels, campaigns, and timelines for your company—not a separate strategy product.",
          },
          ...(tier === "blueprint-plus"
            ? ([
                {
                  term: "Ship-ready",
                  definition:
                    "Copy, tables, or prompts written so your team can paste, brief, or verify them with minimal rewriting—aligned to your diagnostic, not boilerplate.",
                },
              ] as const)
            : []),
        ],
      };
    case "workbook":
      return {
        eyebrow: "Workbook",
        title: "Refinement and versioning",
        guidance:
          tier === "snapshot" || tier === "snapshot-plus"
            ? forCompany(
                co,
                "Edit in parallel while you read Foundation through Activation. Saved Workbook text flows into linked PDFs when you generate from Downloads (where your tier includes exports).",
              )
            : forCompany(
                co,
                "Keep refinements here while you review Foundation through Activation. Downloads pull the latest saved Workbook content when you generate strategy, standards, or activation documents included in your tier.",
              ),
        glossary: [
          {
            term: "Workbook",
            definition:
              "Your editable layer inside the Suite—use it to tighten language, add proof, or align teams before you export final PDFs or bundles.",
          },
        ],
      };
    case "downloads":
      return {
        eyebrow: "Downloads",
        title: "Deliverables and exports",
        guidance:
          tier === "snapshot"
            ? forCompany(co, "Generate your Snapshot report PDF from here when you are ready.")
            : tier === "snapshot-plus"
              ? forCompany(
                  co,
                  "Included with Snapshot+: Snapshot report, Executive Summary, and Prompt Guide PDFs. Generate after you are happy with Workbook edits that feed linked sections.",
                )
              : tier === "blueprint"
                ? forCompany(
                    co,
                    "Included with Blueprint: core strategy and standards PDFs plus activation schedule exports. Generate once Workbook reflects the wording you want on paper.",
                  )
                : forCompany(
                    co,
                    "Included with Blueprint+: full activation plan, digital strategy, competitive brief, strategic action plan, activation schedule, voice checklist, role packs, and bundle export—generate last, after Workbook matches what stakeholders should receive.",
                  ),
        glossary:
          tier === "blueprint-plus"
            ? [
                {
                  term: "Role packs",
                  definition:
                    "Blueprint+ only—PDF bundles framed for leadership, marketing, sales, and design so each team sees the slices they need without sharing the entire library.",
                },
              ]
            : tier === "blueprint"
              ? [
                  {
                    term: "Activation schedule",
                    definition:
                      "A structured timeline export (included with Blueprint) so teams can see what runs when—aligned to the plan in this report.",
                  },
                ]
              : undefined,
      };
  }
}

/** One-line linear hint for tabs that render their own hero (not Results/Foundation shell cards). */
export function getSuiteProgressHint(tier: ProductTier, tab: Exclude<ResultsTab, "results" | "foundation">): string {
  switch (tab) {
    case "strategy":
      if (tier === "snapshot") return "";
      if (tier === "blueprint" || tier === "blueprint-plus") {
        return "Blueprint and Blueprint+ share the same Strategy depth—including how what you sell fits the plan. The tier gap is Activation richness and Download bundles, not a “lighter strategy” on Blueprint.";
      }
      return "After Foundation, Strategy is the market-facing plan: audiences, journey, channels, spend, and what to tackle first—in plain language tied to your diagnostic.";
    case "standards":
      return "Use Brand Standards as the quality gate after Strategy and before you scale creative in Activation.";
    case "activation":
      if (tier === "blueprint-plus") {
        return "Blueprint+ Activation emphasizes finished artifacts (copy, plans, schedules, prompts) included in your purchase—not a generic project checklist.";
      }
      if (tier === "blueprint") {
        return "Blueprint Activation is structured execution—plans and schedules you can brief and refine; Blueprint+ layers in more paste-ready copy and export depth.";
      }
      if (tier === "snapshot-plus") {
        return "Snapshot+ Activation is playbook and timeline focused—run it after Strategy (and Brand Standards when your product includes that tab).";
      }
      return "After Brand Standards, use the sections below to assign owners and ship.";
    case "workbook":
      return "Edit Workbook as you read other tabs; Downloads use the latest saved text when you generate linked PDFs.";
    case "downloads":
      if (tier === "snapshot" || tier === "snapshot-plus") return "";
      return "Generate exports once Workbook-linked sections read the way you want clients or vendors to see them.";
    default:
      return "";
  }
}

/** Shown under the chips title on tabs that use section jump navigation (TabPageWithSidebar). */
export const TAB_SECTION_NAV_HINT =
  "Click any section to scroll there—the left sidebar lists the same shortcuts.";

/** Same as above when there is no sidebar (Results / Foundation tab shells). */
export const TAB_SECTION_NAV_HINT_CHIPS_ONLY = "Click any section to scroll there.";

/** Suite tabs with Foundation-style left nav (large screens): chips + left column list the same sections. */
export const TAB_SECTION_NAV_HINT_SUITE_SIDEBAR =
  "Click any section to scroll there. On large screens, the same links appear in the left column.";
