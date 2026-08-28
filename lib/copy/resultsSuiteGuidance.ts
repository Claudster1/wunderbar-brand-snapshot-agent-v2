import type { ProductTier, ResultsTab } from "@/components/results/tabConfig";
import { glossaryTerm } from "@/lib/copy/abbreviationPolicy";

/**
 * Tier-aware “how to use” and tab intros so the Suite reads as a clear path:
 * Results → Foundation (brand basics) → Strategy (who to win & where) → Brand Standards →
 * Activation (what to publish/run) → Workbook ↔ Downloads.
 *
 * Prefer everyday words; define product terms once in the glossary.
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
    "Treat this as a working guide before you publish or brief a partner. Come back when your offer, audience, or channels change.";

  switch (tier) {
    case "snapshot":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Read top to bottom. Each section explains your score in plain language—what’s working, where buyers get stuck, and what to fix first. Snapshot+ unlocks Foundation, Strategy, Activation, and Workbook when you want the full Suite.",
        habits,
      };
    case "snapshot-plus":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Start with Results for the big picture. Foundation holds your brand basics (how you stand out, the few ideas you repeat, who you serve, and how you sound). Strategy turns that into who to win first, where to show up, and what to do next. Activation breaks the plan into channel-by-channel steps and timelines. Save edits in Workbook. Brand Standards and fuller downloads unlock on Blueprint.",
        habits,
      };
    case "blueprint":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Follow the tabs in order: Results → Foundation → Strategy (including how what you sell fits the story) → Brand Standards → Activation. You’ll get plans and schedules you can brief a team on. Blueprint+ keeps the same Strategy depth, then adds more ready-to-paste copy in Activation and larger download packs.",
        habits,
      };
    case "blueprint-plus":
      return {
        lead: `How to use your ${productName}:`,
        path:
          "Same path as Blueprint: Results through Brand Standards, then Activation. Blueprint+ focuses on finished pieces—copy blocks, channel plans, schedules, and prompts you can hand to marketing or sales. Roadmaps still show the order of work, but each step should name something you can publish or brief. Polish in Workbook, then use Downloads when someone needs a PDF pack.",
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
        title: "Your scores and what to do first",
        guidance:
          tier === "snapshot"
            ? forCompany(
                co,
                "Your WunderBrand Score™ and five score areas show where the brand is strong today and where friction shows up first. Scroll in order—email unlocks the full diagnostic on this page. Upgrade when you want the full Suite path (Foundation → Strategy → Activation → Workbook).",
              )
            : tier === "snapshot-plus"
              ? forCompany(
                  co,
                  "Scores summarize the diagnostic. The sections below translate them into what to protect, what to fix first, and how the five score areas affect each other. Then continue Foundation → Strategy → Activation so the story and the plan stay connected.",
                )
              : tier === "blueprint"
                ? forCompany(
                    co,
                    "Use this page as the short leadership summary, then walk Foundation → Strategy → Brand Standards → Activation so decisions match your downloads.",
                  )
                : forCompany(
                    co,
                    "Use this page as the short leadership summary, then walk Foundation → Strategy → Brand Standards → Activation. Blueprint+ pairs the same strategy depth with more ready-to-use copy—refine in Workbook before you generate final packs from Downloads.",
                  ),
        glossary: [
          {
            term: "WunderBrand Score™",
            definition:
              "A 0–100 headline score from our model. It blends the five score areas with weights—it is not a simple average of the 0–20 pillar numbers.",
          },
          {
            term: "Score areas (pillars)",
            definition:
              "Five parts of brand health we measure (for example positioning and messaging). “Pillar” here means a score area—not your marketing message themes.",
          },
          glossaryTerm("KPI"),
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
        title: "Your brand basics",
        guidance:
          tier === "snapshot-plus"
            ? forCompany(
                co,
                "This tab is your brand story in one place—how you stand out, the few ideas you repeat, who you serve, how you sound, and how the pieces fit. Strategy is next: who to prioritize in the market and how channels and budget support that story.",
              )
            : tier === "blueprint"
              ? forCompany(
                  co,
                  "Foundation is the same on Blueprint and Blueprint+: your long-form brand reference. Strategy adds the go-to-market plan, including how what you sell fits the brand story.",
                )
              : tier === "blueprint-plus"
                ? forCompany(
                    co,
                    "Foundation matches Blueprint here—the tier difference is not on this tab. Blueprint+ adds more ready-to-run assets in Activation and more export packs in Downloads.",
                  )
                : "Upgrade to Snapshot+ to unlock Foundation—how you stand out, the ideas you repeat, who you serve, and how you sound in one place.",
        glossary: [
          {
            term: "Positioning",
            definition:
              "The one idea buyers should remember about you versus alternatives—not just a slogan.",
          },
          {
            term: "Message themes (pillars)",
            definition:
              "A small set of ideas your brand should repeat so every channel tells the same story. Different from the five diagnostic score areas.",
          },
          glossaryTerm("ICP"),
          glossaryTerm("JTBD"),
          glossaryTerm("POV"),
        ],
      };
    case "strategy":
      return {
        eyebrow: "Strategy",
        title: "Who to win and where to show up",
        guidance:
          tier === "snapshot"
            ? "Upgrade to Snapshot+ to unlock Strategy—who to prioritize, how buyers decide, which channels matter, and what to do first on top of Foundation."
            : tier === "snapshot-plus"
              ? forCompany(
                  co,
                  "Strategy builds on Foundation: who to win first, how they decide, where to show up, how budget should move, and what to do before everything else. Some panels use simpler language for finance or leadership—skip them if you don’t need them. Next, Activation turns this into channel-by-channel plans (use Brand Standards first when your product includes it).",
                )
              : tier === "blueprint"
                ? forCompany(
                    co,
                    "You’ll see the full plan—audiences, journey, competitors, channels, spend, priorities—and how what you sell fits the story. Blueprint+ does not change this tab’s depth; it adds more ready-to-use material under Activation and richer exports.",
                  )
                : forCompany(
                    co,
                    "Same strategy coverage as Blueprint: audiences, journey, competitors, channels, spend, priorities, and how offers connect to the story. Blueprint+ invests more in Activation (ready-to-paste assets) and Downloads—not in rewriting Strategy.",
                  ),
        glossary: [
          glossaryTerm(
            "GTM",
            "Your practical plan for reaching and winning buyers—who first, which channels, what message, and how you use time and budget.",
          ),
          glossaryTerm("ICP"),
          glossaryTerm("SEO"),
          glossaryTerm("AEO"),
          glossaryTerm("ROI"),
          glossaryTerm("CRM"),
          glossaryTerm("UTM"),
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
        title: "Rules before you publish",
        guidance:
          tier === "blueprint"
            ? forCompany(
                co,
                "After Strategy, use this tab as a publishing checkpoint: voice rules, message guardrails, and visual direction so external materials stay on-brand. Then move to Activation to assign owners and timelines.",
              )
            : forCompany(
                co,
                "Same publishing checkpoint as Blueprint, with extra internal and vendor-ready standards in your Blueprint+ downloads. Finish edits here before you generate final standards PDFs.",
              ),
        glossary: [
          {
            term: "Brand Standards",
            definition:
              "A short rule set—voice, messaging, and visual cues—so anyone creating content can match your brand without re-reading the whole strategy.",
          },
          glossaryTerm("CTA"),
          glossaryTerm("QA"),
          glossaryTerm("SEO"),
          glossaryTerm("AEO"),
          glossaryTerm("POV"),
          glossaryTerm("ICP"),
        ],
      };
    case "activation":
      return {
        eyebrow: "Activation",
        title: tier === "blueprint-plus" ? "Plans and copy you can run" : "Plans you can run",
        guidance:
          tier === "snapshot-plus"
            ? forCompany(
                co,
                "This tier includes channel-by-channel plans, owners, milestones, and schedules tied to your Strategy—so a team can run the plan, not just read it. Use Brand Standards first when your product includes it, so publish checks happen before you scale creative.",
              )
            : tier === "blueprint-plus"
              ? forCompany(
                  co,
                  "Blueprint+ Activation is built around finished pieces: ready-to-paste copy, email sequences, channel plans, schedules, and the Prompt Library grounded in your diagnostic. Roadmaps still show order, but each block should give you something you can brief or publish—not a vague to-do list. Polish in Workbook, then package from Downloads.",
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
              "Where the strategy becomes channel plans, campaigns, and timelines for your company—ready work, not a second strategy document.",
          },
          glossaryTerm("CTA"),
          glossaryTerm("KPI"),
          glossaryTerm("CRM"),
          glossaryTerm("UTM"),
          ...(tier === "blueprint-plus"
            ? ([
                {
                  term: "Ready to paste or brief",
                  definition:
                    "Copy, tables, or prompts written so your team can use them with little rewriting—tied to your diagnostic, not generic filler.",
                },
              ] as const)
            : []),
        ],
      };
    case "workbook":
      return {
        eyebrow: "Workbook",
        title: "Your editable working copy",
        guidance:
          tier === "snapshot" || tier === "snapshot-plus"
            ? forCompany(
                co,
                "Edit here while you read Foundation through Activation. Run AI prompts from Activation → Prompt Library, paste finished language here, then generate linked PDFs from Downloads (where your tier includes exports).",
              )
            : forCompany(
                co,
                "Keep refinements here while you review Foundation through Activation. Downloads pull the latest saved Workbook content when you generate strategy, standards, or activation documents included in your tier.",
              ),
        glossary: [
          {
            term: "Workbook",
            definition:
              "Your editable layer inside the Suite—tighten language, add proof, or align teams before you export final PDFs.",
          },
          glossaryTerm("CMS"),
          glossaryTerm("QA"),
        ],
      };
    case "downloads":
      return {
        eyebrow: "Downloads",
        title: "PDFs and export packs",
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
                    "Blueprint+ only—PDF bundles framed for leadership, marketing, sales, and design so each team sees what they need without the entire library.",
                },
              ]
            : tier === "blueprint"
              ? [
                  {
                    term: "Activation schedule",
                    definition:
                      "A timeline export (included with Blueprint) so teams can see what runs when—aligned to the plan in this report.",
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
        return "Blueprint and Blueprint+ share the same Strategy depth—including how what you sell fits the plan. The difference is more ready-to-use copy in Activation and larger Download packs—not a lighter strategy on Blueprint.";
      }
      return "After Foundation, Strategy is the market-facing plan: who to win, how they decide, where to show up, how budget moves, and what to do first—tied to your diagnostic.";
    case "standards":
      return "Use Brand Standards as the checklist after Strategy and before you scale creative in Activation.";
    case "activation":
      if (tier === "blueprint-plus") {
        return "Blueprint+ Activation emphasizes finished pieces (copy, plans, schedules, prompts)—not a generic project checklist.";
      }
      if (tier === "blueprint") {
        return "Blueprint Activation is structured execution—plans and schedules you can brief and refine; Blueprint+ adds more ready-to-paste copy and deeper exports.";
      }
      if (tier === "snapshot-plus") {
        return "Snapshot+ Activation focuses on channel plans and timelines—run it after Strategy (and Brand Standards when your product includes that tab).";
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
