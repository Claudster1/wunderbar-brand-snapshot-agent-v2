"use client";

import type { CSSProperties, ReactNode } from "react";

import type { ProductTier } from "@/components/ResultsTabNav";
import { SectionGlyph } from "@/components/results/BrandIcons";
import { MoodOutputsGraphic } from "@/components/results/MoodOutputsGraphic";
import PersonalizedGuidanceCard from "@/components/results/PersonalizedGuidanceCard";
import { ReportCallout } from "@/components/results/ReportDesignPrimitives";
import TabPageWithSidebar from "@/components/results/TabPageWithSidebar";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_PANEL_RAIL,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
} from "@/components/results/suiteBrandTokens";
import { getSuiteProgressHint } from "@/lib/copy/resultsSuiteGuidance";
import {
  normalizeBrandImageryDirection,
  type NormalizedBrandImageryDirection,
} from "@/lib/brand/brandImageryNormalize";
import { STANDARDS_SUITE_NAV_ITEMS } from "@/lib/results/standardsSuiteNav";
import type { WorkbookSectionId } from "@/lib/workbookTypes";
import { EXAMPLE_CALLOUT, SEMANTIC_DO, SEMANTIC_DONT } from "@/src/pdf/reportVisualTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;
const WHITE = "#FFFFFF";
/** Wunderbar Digital long-form body (aligned with PDF example / narrative text). */
const BODY_TEXT = EXAMPLE_CALLOUT.bodyColor;
const SECTION_SHELL: CSSProperties = {
  border: `1px solid ${BORDER}`,
  borderRadius: SUITE_RADIUS_MD,
  borderTop: `2px solid ${BLUE}30`,
  borderLeft: `3px solid ${SUITE_PANEL_RAIL}`,
  background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
  padding: "18px 20px",
  marginBottom: 14,
  scrollMarginTop: 120,
  boxShadow: SUITE_SHADOW_CARD,
};
const INNER_CARD: CSSProperties = {
  border: `1px solid ${BORDER}`,
  borderRadius: SUITE_RADIUS_MD,
  background: WHITE,
};
const EDIT_IN_WORKBOOK_BTN: CSSProperties = {
  padding: "8px 14px",
  borderRadius: SUITE_RADIUS_BUTTON,
  border: "none",
  background: BLUE,
  color: WHITE,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
};

interface BrandStandardsTabProps {
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  onEditInWorkbook: (sectionId: WorkbookSectionId) => void;
  shellRendersSectionChips?: boolean;
  shellActiveSectionId?: string | null;
}

interface MoodBoardImageSample {
  url: string;
  caption?: string;
  rationale?: string;
}

type StandardsDocPlan = {
  id: string;
  title: string;
  audience: string;
  availableFrom: ProductTier;
  includes: string[];
  editSections: WorkbookSectionId[];
};

interface PaletteRow {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  description: string;
  rationale: string;
}

function firstSentence(input: string): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const split = normalized.split(/[.!?](\s|$)/).filter(Boolean);
  return split[0]?.trim() || normalized;
}

function firstNWords(input: string, count: number): string {
  const words = input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.slice(0, count).join(" ");
}

function titleCase(input: string): string {
  return input
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();
}

function asStringLoose(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringListLoose(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim());
  }
  const one = asStringLoose(value);
  return one ? [one] : [];
}

function hexToRgb(hexInput: string): string {
  const hex = hexInput.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "0, 0, 0";
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `${red}, ${green}, ${blue}`;
}

function hexToCmyk(hexInput: string): string {
  const hex = hexInput.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "0, 0, 0, 100";
  const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const key = 1 - Math.max(red, green, blue);
  if (key >= 0.9999) return "0, 0, 0, 100";
  const cyan = ((1 - red - key) / (1 - key)) * 100;
  const magenta = ((1 - green - key) / (1 - key)) * 100;
  const yellow = ((1 - blue - key) / (1 - key)) * 100;
  const black = key * 100;
  const format = (value: number) => Math.round(Math.max(0, Math.min(100, value)));
  return `${format(cyan)}, ${format(magenta)}, ${format(yellow)}, ${format(black)}`;
}

function visualCuesForArchetype(archetype: string): { imagery: string; composition: string } {
  const key = archetype.toLowerCase();
  if (key.includes("sage")) {
    return {
      imagery: "Use evidence-forward visuals: data overlays, expert at work, strategy workshops, annotated frameworks.",
      composition: "Prefer structured layouts with strong grid alignment, clear hierarchy, and restrained decorative elements.",
    };
  }
  if (key.includes("creator")) {
    return {
      imagery: "Use expressive visual concepts: contrast, crafted detail shots, process visuals, and distinctive brand texture.",
      composition: "Use modular but dynamic composition with focal moments and whitespace to spotlight signature elements.",
    };
  }
  if (key.includes("explorer")) {
    return {
      imagery: "Use discovery-led imagery: movement, progression, map-like flow, and before/after transformation contexts.",
      composition: "Use directional layouts that guide the eye through exploration paths, milestones, and outcomes.",
    };
  }
  if (key.includes("caregiver")) {
    return {
      imagery: "Use trust-centered imagery: human interaction, support moments, and practical implementation scenes.",
      composition: "Use calm layouts with supportive spacing, clear reassurance blocks, and low cognitive load.",
    };
  }
  return {
    imagery: "Use real-world contextual visuals that demonstrate service delivery, outcomes, and decision confidence.",
    composition: "Use clean hierarchy-first layout with clear proof placement and one primary action per section.",
  };
}

function ExampleCard({
  title,
  good,
  bad,
}: {
  title: string;
  good: string;
  bad: string;
}) {
  return (
    <div style={{ ...INNER_CARD, padding: "14px 16px" }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", color: MID_GRAY }}>
        {title}
      </p>
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        <div
          style={{
            borderLeft: `3px solid ${SEMANTIC_DO.border}`,
            background: SEMANTIC_DO.bg,
            padding: "8px 10px",
            borderRadius: 5,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: SEMANTIC_DO.label }}>Do this</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.55 }}>{good}</p>
        </div>
        <div
          style={{
            borderLeft: `3px solid ${SEMANTIC_DONT.border}`,
            background: SEMANTIC_DONT.bg,
            padding: "8px 10px",
            borderRadius: 5,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: SEMANTIC_DONT.label }}>Not this</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.55 }}>{bad}</p>
        </div>
      </div>
    </div>
  );
}

const IMPLEMENTATION_CARD_ACCENTS: ReadonlyArray<{ rail: string; badgeBg: string; badgeText: string; wash: string }> = [
  { rail: "#07B0F2", badgeBg: "rgba(7, 176, 242, 0.14)", badgeText: "#024E70", wash: "linear-gradient(145deg, #F0FAFF 0%, #FFFFFF 52%)" },
  { rail: "#6366F1", badgeBg: "rgba(99, 102, 241, 0.12)", badgeText: "#312E81", wash: "linear-gradient(145deg, #F8F7FF 0%, #FFFFFF 52%)" },
  { rail: "#0D9488", badgeBg: "rgba(13, 148, 136, 0.12)", badgeText: "#134E4A", wash: "linear-gradient(145deg, #F0FDF9 0%, #FFFFFF 52%)" },
];

/** Lato roles aligned with “Typography standards” below (sizes scaled for in-card previews vs full-page web). */
const IMPL_TYPO = {
  specTag: {
    margin: 0,
    marginBottom: 6,
    fontFamily: SUITE_FONT_UI,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: MID_GRAY,
  },
  headline: {
    fontFamily: SUITE_FONT_UI,
    fontWeight: 800,
    fontSize: 22,
    lineHeight: 1.22,
    color: NAVY,
    letterSpacing: "-0.02em",
  },
  subhead: {
    fontFamily: SUITE_FONT_UI,
    fontWeight: 650,
    fontSize: 17,
    lineHeight: 1.35,
    color: NAVY,
  },
  body: {
    fontFamily: SUITE_FONT_UI,
    fontWeight: 450,
    fontSize: 15,
    lineHeight: 1.65,
    color: BODY_TEXT,
  },
  metaCaption: {
    fontFamily: SUITE_FONT_UI,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 1.55,
    color: MID_GRAY,
  },
  channelLabel: {
    fontFamily: SUITE_FONT_UI,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: MID_GRAY,
  },
  cta: {
    fontFamily: SUITE_FONT_UI,
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.35,
    color: BLUE,
  },
} satisfies Record<string, CSSProperties>;

function ImplementationTypoBlock({
  specTitle,
  style,
  children,
}: {
  specTitle: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={IMPL_TYPO.specTag}>{specTitle}</p>
      <div style={style}>{children}</div>
    </div>
  );
}

function ImplementationExampleCard({
  index,
  glyphToken,
  eyebrow,
  title,
  blocks,
}: {
  index: number;
  glyphToken: "paid" | "thought" | "email";
  eyebrow: string;
  title: string;
  blocks: Array<{
    specTitle: string;
    role: "headline" | "subhead" | "body" | "metaCaption" | "channelLabel" | "cta";
    content: ReactNode;
  }>;
}) {
  const accent = IMPLEMENTATION_CARD_ACCENTS[(index - 1) % IMPLEMENTATION_CARD_ACCENTS.length]!;
  const roleStyle: Record<(typeof blocks)[number]["role"], CSSProperties> = {
    headline: IMPL_TYPO.headline,
    subhead: IMPL_TYPO.subhead,
    body: IMPL_TYPO.body,
    metaCaption: IMPL_TYPO.metaCaption,
    channelLabel: IMPL_TYPO.channelLabel,
    cta: IMPL_TYPO.cta,
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg border border-black/[0.07]"
      style={{
        background: accent.wash,
        borderLeft: `4px solid ${accent.rail}`,
        boxShadow: "0 2px 16px rgba(2, 24, 89, 0.06)",
      }}
    >
      <div className="flex flex-wrap items-start gap-3 px-4 pb-2 pt-4 sm:px-5">
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-lg font-extrabold tabular-nums"
          style={{
            minWidth: 36,
            height: 36,
            fontSize: 13,
            letterSpacing: "0.06em",
            background: accent.badgeBg,
            color: accent.badgeText,
            fontFamily: SUITE_FONT_UI,
          }}
          aria-hidden
        >
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SectionGlyph token={glyphToken} size={20} color={accent.rail} />
            <div>
              <p className="m-0" style={IMPL_TYPO.channelLabel}>
                {eyebrow}
              </p>
              <p className="m-0 mt-1" style={IMPL_TYPO.subhead}>
                {title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black/[0.06] bg-white/85 px-4 py-4 sm:px-5">
        {blocks.map((b, i) => (
          <ImplementationTypoBlock key={i} specTitle={b.specTitle} style={{ ...roleStyle[b.role], margin: 0 }}>
            {typeof b.content === "string" ? <p style={{ margin: 0 }}>{b.content}</p> : b.content}
          </ImplementationTypoBlock>
        ))}
      </div>
    </div>
  );
}

export default function BrandStandardsTab({
  productTier,
  diagnosticData,
  onEditInWorkbook,
  shellRendersSectionChips = false,
  shellActiveSectionId = null,
}: BrandStandardsTabProps) {
  const rawImagery = diagnosticData.brand_imagery_direction ?? diagnosticData.brandImageryDirection;
  const imageryNorm: NormalizedBrandImageryDirection | null = normalizeBrandImageryDirection(rawImagery);
  const moodBoardSamples: MoodBoardImageSample[] = (imageryNorm?.mood_board_image_samples ?? []).slice(0, 6).map((s) => ({
    url: s.url,
    caption: s.caption,
    rationale: s.rationale,
  }));
  const moodDesc = imageryNorm?.mood_board_descriptors;
  const aiImagePrompts = imageryNorm?.ai_image_generation_prompts ?? [];
  const subjectShow = imageryNorm?.subject_matter_guidance?.show ?? [];
  const subjectAvoid = imageryNorm?.subject_matter_guidance?.avoid ?? [];
  const photographyDirection = (imageryNorm?.photography_style_direction ?? "").trim();
  const hasMoodBoardFallbackFromImagery =
    !moodDesc &&
    moodBoardSamples.length === 0 &&
    aiImagePrompts.length === 0 &&
    (Boolean(photographyDirection) || subjectShow.length > 0);
  const visualModeRaw = diagnosticData.visualSystemMode ?? diagnosticData.visual_system_mode;
  const visualSystemMode =
    visualModeRaw === "existing" || visualModeRaw === "optimize" || visualModeRaw === "refresh"
      ? visualModeRaw
      : undefined;

  const bsgRaw = diagnosticData.brandStandardsGuide;
  const logoGuidelinesRaw =
    bsgRaw && typeof bsgRaw === "object" && !Array.isArray(bsgRaw)
      ? ((bsgRaw as Record<string, unknown>).logoGuidelines ??
          (bsgRaw as Record<string, unknown>).logo_guidelines)
      : undefined;
  const logoG =
    logoGuidelinesRaw && typeof logoGuidelinesRaw === "object" && !Array.isArray(logoGuidelinesRaw)
      ? (logoGuidelinesRaw as Record<string, unknown>)
      : undefined;
  const reportLogoOverview = asStringLoose(logoG?.overview);
  const reportLogoClearSpace = asStringLoose(logoG?.clearSpace ?? logoG?.clear_space);
  const reportLogoMinSize = asStringLoose(logoG?.minimumSize ?? logoG?.minimum_size);
  const reportLogoPlacement = asStringListLoose(logoG?.placementRules ?? logoG?.placement_rules);
  const reportLogoIncorrect = asStringListLoose(logoG?.incorrectUses ?? logoG?.incorrect_uses);
  const hasReportLogoGuidance =
    Boolean(reportLogoOverview) ||
    Boolean(reportLogoClearSpace) ||
    Boolean(reportLogoMinSize) ||
    reportLogoPlacement.length > 0 ||
    reportLogoIncorrect.length > 0;

  const stock = imageryNorm?.stock_photo_selection_criteria;
  const stockLines = stock
    ? [
        stock.lighting && `Lighting: ${stock.lighting}`,
        stock.composition && `Composition: ${stock.composition}`,
        stock.color_temperature && `Color temperature: ${stock.color_temperature}`,
        stock.diversity && `Representation: ${stock.diversity}`,
        stock.authenticity_markers && `Authenticity: ${stock.authenticity_markers}`,
      ].filter((x): x is string => Boolean(x))
    : [];
  const reportImageDonts = imageryNorm?.image_donts ?? [];

  const businessName =
    typeof diagnosticData.companyName === "string" && diagnosticData.companyName
      ? diagnosticData.companyName
      : "Your Brand";
  const archetype =
    typeof diagnosticData.primaryArchetype === "string" && diagnosticData.primaryArchetype
      ? diagnosticData.primaryArchetype
      : "The Sage";
  const audience =
    typeof diagnosticData.targetAudience === "string" && diagnosticData.targetAudience
      ? diagnosticData.targetAudience
      : "Founders and marketing leaders evaluating strategic partners.";
  const industry =
    typeof diagnosticData.industry === "string" && diagnosticData.industry
      ? diagnosticData.industry
      : "your market";
  const primaryPillar =
    typeof diagnosticData.primaryPillar === "string" && diagnosticData.primaryPillar
      ? diagnosticData.primaryPillar
      : "Messaging";
  const topStrength =
    Array.isArray(diagnosticData.topStrengths) && diagnosticData.topStrengths.length > 0
      ? String(diagnosticData.topStrengths[0])
      : "strategic clarity";
  const topGap =
    Array.isArray(diagnosticData.topGaps) && diagnosticData.topGaps.length > 0
      ? String(diagnosticData.topGaps[0])
      : "message consistency across channels";
  const voiceAttributes =
    Array.isArray(diagnosticData.voiceAttributes) && diagnosticData.voiceAttributes.length > 0
      ? diagnosticData.voiceAttributes.slice(0, 3).map((item) => String(item))
      : ["clear", "confident", "practical"];
  const strategicPriorities =
    ((diagnosticData.strategicPriorities as Array<{ title?: string; pillar?: string }> | undefined) ?? [])
      .slice(0, 3)
      .map((item) => ({
        title: typeof item.title === "string" ? item.title : "",
        pillar: typeof item.pillar === "string" ? item.pillar : "",
      }))
      .filter((item) => item.title);
  const channelPlans =
    (diagnosticData.channelPlans as Record<string, string> | undefined) ?? {};
  const emailPlan = firstSentence(channelPlans.email || "");
  const seoAeoPlan = firstSentence(channelPlans["content-seo"] || channelPlans.seo || "");
  const socialPlan = firstSentence(channelPlans.social || "");
  const visualCues = visualCuesForArchetype(archetype);
  const audienceShort = firstNWords(audience, 8).toLowerCase() || "decision-makers";
  const audienceLabel = titleCase(firstNWords(audience, 6) || "Target Audience");
  const prioritySnippet =
    strategicPriorities.length > 0
      ? strategicPriorities.map((item) => item.title).join("; ")
      : `Improve ${topGap} while reinforcing ${topStrength}.`;
  const firstPriority = strategicPriorities[0]?.title || `Close ${topGap.toLowerCase()}`;
  const secondPriority =
    strategicPriorities[1]?.title || `Scale ${topStrength.toLowerCase()} across channels`;
  const positioningSnippet =
    typeof diagnosticData.positioningMessagingFramework === "string" &&
    diagnosticData.positioningMessagingFramework.trim()
      ? firstSentence(diagnosticData.positioningMessagingFramework)
      : typeof diagnosticData.topOpportunity === "string" && diagnosticData.topOpportunity.trim()
        ? firstSentence(diagnosticData.topOpportunity)
        : "";

  const palette =
    (diagnosticData.enriched_color_palette as Array<{
      name?: string;
      hex?: string;
      role?: string;
      description?: string;
      rationale?: string;
      rgb?: string;
      cmyk?: string;
    }> | undefined) ?? [];
  const paletteRows: PaletteRow[] =
    palette.length > 0
      ? palette.slice(0, 4).map((color, index) => {
          const safeHex = color.hex || "#07B0F2";
          const fallbackName =
            index === 0
              ? "Signal Azure"
              : index === 1
                ? "Authority Midnight"
                : index === 2
                  ? "Clarity Slate"
                  : "Canvas Frost";
          return {
            name: color.name || fallbackName,
            hex: safeHex,
            rgb: color.rgb || hexToRgb(safeHex),
            cmyk: color.cmyk || hexToCmyk(safeHex),
            description:
              color.description ||
              color.role ||
              (index === 0
                ? "Primary action color for links, interactive highlights, and high-priority prompts."
                : index === 1
                  ? "Primary authority base for headlines, key section anchors, and strategic emphasis."
                  : index === 2
                    ? "Supportive neutral for long-form body copy, labels, and explanatory context."
                    : "Light structural background for cards and long-form reading surfaces."),
            rationale:
              color.rationale ||
              (index === 0
                ? "Creates immediate visual energy and draws attention to conversion actions without overwhelming the reading flow."
                : index === 1
                  ? "Provides trust, seriousness, and contrast so strategic guidance feels premium and credible."
                  : index === 2
                    ? "Improves readability and pacing by softening dense content areas while preserving hierarchy."
                    : "Keeps pages bright and breathable, reducing cognitive load across long report sections."),
          };
        })
      : [
          {
            name: "Signal Azure",
            hex: "#07B0F2",
            rgb: hexToRgb("#07B0F2"),
            cmyk: hexToCmyk("#07B0F2"),
            description: `Primary conversion accent for ${businessName} CTAs, links, and section highlights.`,
            rationale:
              "This hue carries momentum and clarity, helping users instantly identify the next action across UI and report outputs.",
          },
          {
            name: "Authority Midnight",
            hex: "#021859",
            rgb: hexToRgb("#021859"),
            cmyk: hexToCmyk("#021859"),
            description: `Strategic anchor for headlines, key claims, and ${primaryPillar.toLowerCase()} proof modules.`,
            rationale:
              "Deep navy signals credibility and executive confidence, reinforcing high-value guidance and premium positioning.",
          },
          {
            name: "Clarity Slate",
            hex: "#5A6B7E",
            rgb: hexToRgb("#5A6B7E"),
            cmyk: hexToCmyk("#5A6B7E"),
            description: `Supporting neutral for body copy and explanatory narrative aimed at ${audienceShort}.`,
            rationale:
              "Balanced contrast keeps long-form content easy to scan while preventing visual fatigue in dense strategic sections.",
          },
          {
            name: "Canvas Frost",
            hex: "#F5F7FA",
            rgb: hexToRgb("#F5F7FA"),
            cmyk: hexToCmyk("#F5F7FA"),
            description: "Base canvas for cards, workbook zones, and content grouping on long-form pages.",
            rationale:
              "A cool near-white surface creates breathing room and separation, making complex frameworks easier to consume.",
          },
        ];
  const accentHex = paletteRows[0]?.hex ?? "#07B0F2";
  const accentName = paletteRows[0]?.name ?? "Primary accent";
  const authorityHex = paletteRows[1]?.hex ?? NAVY;
  const standardsDepth = {
    publishingChecklist: [
      `The claim names a concrete outcome for ${audienceShort} and ties to your ${primaryPillar.toLowerCase()} pillar—not a generic category line anyone in ${industry.toLowerCase()} could use.`,
      `At least one proof element (metric, logo row, quote, or outcome detail) appears before the primary CTA so ${businessName} earns the next step.`,
      `Copy sounds ${voiceAttributes.slice(0, 2).join(" and ").toLowerCase()}—aligned with the ${archetype} archetype you committed to in the workbook.`,
      `The CTA matches funnel intent (learn / compare / decide) and points to a next step related to ${firstPriority.toLowerCase()} where that channel fits.`,
      `The asset states one measurable signal buyers can track (timeline, lift, risk removed) for ${primaryPillar.toLowerCase()}—not vibes-only language.`,
    ],
    visualDo: [
      `Lead key blocks with clear hierarchy and breathing room so ${businessName} reads credible in ${industry.toLowerCase()}—headline, proof, then action.`,
      `Place proof modules beside the decision CTA (${accentName} ${accentHex} buttons), not five screens below generic body copy.`,
      `Keep color roles disciplined: ${authorityHex} for authority headlines, ${accentHex} for interactive emphasis—decoration never competes with ${topStrength.toLowerCase()} proof.`,
    ],
    visualDont: [
      `Avoid decorative stock scenes that fight the story while ${topGap.toLowerCase()} is still what ${audienceShort} worry about.`,
      `Don’t bury evidence under long intros—if someone skims, they should still see why ${businessName} before they bounce.`,
      `Don’t stack competing asks (“book,” “download,” “reply”) in one hero; one intent per block, mapped to ${firstPriority.toLowerCase()} or a single funnel stage.`,
    ],
  };
  const standardsDocPlans: StandardsDocPlan[] = [
    {
      id: "internal-master",
      title: "Internal Brand Master Guide",
      audience: "In-house marketing, design, product, and content teams",
      availableFrom: "blueprint-plus",
      includes: [
        "Brand foundation and strategic rationale",
        "Full logo/color/type/voice systems with edge-case guidance",
        "Governance workflows, approvals, and update cadence",
      ],
      editSections: ["positioning-statement", "messaging-framework", "voice-attributes", "channel-notes", "action-plan"],
    },
    {
      id: "external-guide",
      title: "External Brand Guide",
      audience: "Agencies, freelancers, and external collaborators",
      availableFrom: "blueprint",
      includes: [
        "Logo, color, typography, and voice summary",
        "Template/layout guidance and digital specs",
        "Approval contacts and external usage rules",
      ],
      editSections: ["messaging-framework", "voice-attributes", "channel-notes"],
    },
    {
      id: "partner-spec",
      title: "Partner & Vendor Spec Sheet",
      audience: "Printers, production vendors, and one-off partners",
      availableFrom: "blueprint",
      includes: [
        "One-page logo/color/type production specs",
        "File format + resolution requirements by medium",
        "Proofing and mandatory pre-production approval steps",
      ],
      editSections: ["voice-attributes", "channel-notes"],
    },
  ];
  const tierRank: Record<ProductTier, number> = {
    snapshot: 0,
    "snapshot-plus": 1,
    blueprint: 2,
    "blueprint-plus": 3,
  };
  const visibleStandardsDocPlans = standardsDocPlans.filter(
    (plan) => tierRank[productTier] >= tierRank[plan.availableFrom],
  );

  const suiteProgressHint = getSuiteProgressHint(productTier, "standards");

  return (
    <TabPageWithSidebar
      navTitle="Brand Standards"
      navItems={STANDARDS_SUITE_NAV_ITEMS}
      className="standards-tab-content"
      shellRendersSectionChips={shellRendersSectionChips}
      shellActiveSectionId={shellActiveSectionId}
    >
      <div style={{ marginBottom: 20 }}>
        <h2 className="bs-h2 mb-2.5 mt-0">Voice, messaging, and visual direction guidelines</h2>
        {suiteProgressHint ? (
          <p className="text-sm font-semibold text-brand-blue max-w-[780px] mb-2.5 m-0" style={{ lineHeight: 1.55 }}>
            {suiteProgressHint}
          </p>
        ) : null}
        <p className="bs-body-sm text-brand-muted max-w-[780px] m-0 leading-relaxed">
          These standards keep {businessName} consistent across teams, channels, and campaign types—grounded in your diagnostic,
          not generic marketing rules. Start with the <strong className="text-brand-navy">Brand snapshot</strong>, then use
          each section as a QA checkpoint before anything goes live.
        </p>
        <p className="bs-small text-brand-muted max-w-[780px] mt-2 mb-0">
          Included in your downloads for this tier are shown below.
        </p>
      </div>

      <section id="standards-brand-context" style={SECTION_SHELL}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <SectionGlyph token="positioning" size={20} color={BLUE} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>Brand snapshot</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: MID_GRAY, lineHeight: 1.55, maxWidth: 720 }}>
              Shared context for {businessName}: who you serve, what you are doubling down on, and what you are fixing next.
              The checklists and examples below plug into this spine so the tab reads like your playbook—not only do/don&apos;t
              lists.
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: MID_GRAY,
                textTransform: "uppercase",
              }}
            >
              Who you serve
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>
              <strong style={{ color: NAVY }}>{businessName}</strong> in <strong style={{ color: NAVY }}>{industry}</strong>.
              Primary audience: {audience}
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: MID_GRAY,
                textTransform: "uppercase",
              }}
            >
              Strategic spine
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>
              Lead pillar: <strong style={{ color: NAVY }}>{primaryPillar}</strong>. Archetype:{" "}
              <strong style={{ color: NAVY }}>{archetype}</strong> with {voiceAttributes.join(", ").toLowerCase()} delivery.
              Lean into <strong style={{ color: NAVY }}>{topStrength.toLowerCase()}</strong>; close the gap on{" "}
              <strong style={{ color: NAVY }}>{topGap.toLowerCase()}</strong>.
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: MID_GRAY,
                textTransform: "uppercase",
              }}
            >
              Execution focus
            </p>
            {strategicPriorities.length > 0 ? (
              <ul
                className="strategy-suite-ul"
                style={{ margin: "8px 0 0", paddingLeft: 18, color: BODY_TEXT, fontSize: 13, lineHeight: 1.55 }}
              >
                {strategicPriorities.map((p, i) => (
                  <li key={`brand-snap-p-${i}`}>
                    <strong style={{ color: NAVY }}>{p.title}</strong>
                    {p.pillar ? <span style={{ color: MID_GRAY }}> — {p.pillar}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>{prioritySnippet}</p>
            )}
          </div>
        </div>
        {positioningSnippet ? (
          <div
            style={{
              marginTop: 12,
              ...INNER_CARD,
              padding: "12px 14px",
              borderLeft: `3px solid ${BLUE}`,
              background: "#FCFDFF",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: MID_GRAY,
                textTransform: "uppercase",
              }}
            >
              Positioning line (from your workbook)
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: NAVY, lineHeight: 1.55, fontWeight: 600 }}>{positioningSnippet}</p>
          </div>
        ) : null}
      </section>

      <section id="standards-document-framework" style={SECTION_SHELL}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SectionGlyph token="framework" size={18} color={BLUE} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
              Document versions
            </p>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: MID_GRAY }}>
            Brand standards outputs available in your current tier.
          </p>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {visibleStandardsDocPlans.map((plan) => {
            return (
              <div key={plan.id} style={{ ...INNER_CARD, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>{plan.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: MID_GRAY }}>{plan.audience}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditInWorkbook(plan.editSections[0])}
                    style={EDIT_IN_WORKBOOK_BTN}
                  >
                    Edit plan in Workbook
                  </button>
                </div>
                <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                  {plan.includes.map((item) => (
                    <p key={`${plan.id}-${item}`} style={{ margin: 0, fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="standards-voice" style={SECTION_SHELL}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionGlyph token="voice" size={18} color={BLUE} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
                Voice standards
              </p>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: MID_GRAY }}>
              Before/after lines use your audience, pillar, and priorities—then the enforcement card shows how to apply them.
            </p>
          </div>
          <button type="button" onClick={() => onEditInWorkbook("voice-attributes")} style={EDIT_IN_WORKBOOK_BTN}>
            Edit in Workbook
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: BODY_TEXT, lineHeight: 1.6 }}>
          Primary archetype: <strong>{archetype}</strong>. Audience context: {audience}
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6, maxWidth: 720 }}>
          For {businessName}, “on brand” means proof-backed lines that sound {voiceAttributes.join(", ").toLowerCase()}—not a
          generic {industry.toLowerCase()} voice. The examples are written as if they were drafted for your next campaign, then
          corrected.
        </p>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10 }}>
          <ExampleCard
            title="Organic social / paid headline"
            good={`${businessName} helps ${audienceShort} solve ${topGap.toLowerCase()} with ${primaryPillar.toLowerCase()}-led strategy that turns ${topStrength.toLowerCase()} into measurable action.`}
            bad={`${businessName} is a full-service company for ${industry}. We do a bit of everything for everyone.`}
          />
          <ExampleCard
            title="Retargeting / nurture email"
            good={`Based on your diagnostic, we recommend a 90-day rollout anchored on ${primaryPillar.toLowerCase()}. First priorities for ${businessName}: ${prioritySnippet}`}
            bad={`Checking in again. Let us know if you are still interested and we can share more details when available.`}
          />
        </div>
        <PersonalizedGuidanceCard
          title="Voice enforcement"
          doText={`Use ${voiceAttributes.join(", ").toLowerCase()} language and tie every claim to proof people can check.`}
          dontText="Lead with vague inspiration that does not connect to a real outcome."
          example={`${businessName} should swap lines like “transformative growth” for specifics tied to ${firstPriority.toLowerCase()} and what actually changes for the buyer.`}
        />
        <div style={{ marginTop: 10 }}>
          <ReportCallout label="Advanced Voice Controls" accentColor={BLUE}>
            Require a voice QA pass on {businessName} organic posts, paid ads, and nurture emails. Any line that cannot be tied
            to proof, {primaryPillar.toLowerCase()} strategy, or a concrete buyer insight from {audienceShort} should be
            rewritten before publish.
          </ReportCallout>
        </div>
      </section>

      <section id="standards-messaging" style={SECTION_SHELL}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionGlyph token="messaging" size={14} color={BLUE} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
                Messaging standards
              </p>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: MID_GRAY }}>
              Claim ladder and CTAs tailored to {businessName}—plus a worked example using your pillar and proof.
            </p>
          </div>
          <button type="button" onClick={() => onEditInWorkbook("messaging-framework")} style={EDIT_IN_WORKBOOK_BTN}>
            Edit in Workbook
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
          <div style={{ ...INNER_CARD, padding: "10px 12px", background: "#FCFDFF" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Claim formula</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
              Problem → Method → Outcome → Proof
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
              Example: &quot;{businessName} helps {audienceShort} reduce {topGap.toLowerCase()} through {primaryPillar.toLowerCase()}-first execution, producing progress on {firstPriority.toLowerCase()} within 90 days.&quot;
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "10px 12px", background: "#FCFDFF" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Next step wording</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
              Use action + outcome language.
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
              Preferred for {businessName}: &quot;Review My {primaryPillar} Plan&quot;, &quot;Prioritize {firstPriority}&quot;, &quot;Launch {secondPriority}&quot;.
              Avoid generic defaults like &quot;Submit&quot; and &quot;Click Here&quot;.
            </p>
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 5,
            border: `1px solid ${BORDER}`,
            background: "linear-gradient(135deg, #FFFFFF 0%, #F6FAFF 100%)",
            borderLeft: `3px solid ${BLUE}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>In practice for {businessName}</p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
            A prospect in {industry.toLowerCase()} compares you on {topGap.toLowerCase()}. Your page or deck should open with the
            claim formula, show one proof point tied to {topStrength.toLowerCase()}, then invite{" "}
            <strong style={{ color: NAVY }}>{audienceShort}</strong> to take a single step aligned with{" "}
            {firstPriority.toLowerCase()}—for example the CTAs on the left, not a generic &quot;Learn more&quot; with no proof
            path.
          </p>
        </div>
        <PersonalizedGuidanceCard
          title="Messaging QA"
          doText="Before you publish, check: claim, proof, outcome, then one clear next step."
          dontText="Publish big claims with thin proof, or ask for action before you have given context."
          example={`For ${businessName}, every ${primaryPillar.toLowerCase()} claim should point to diagnostic detail, how you deliver, or a real outcome.`}
        />
        <div
          style={{
            marginTop: 14,
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${BORDER}`,
            borderLeft: `4px solid ${BLUE}`,
            background: "linear-gradient(165deg, #F5FAFF 0%, #FFFFFF 42%, #FFFFFF 100%)",
            boxShadow: "0 2px 18px rgba(2, 24, 89, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px 12px",
              borderBottom: `1px solid ${BORDER}`,
              background: "rgba(255,255,255,0.65)",
            }}
          >
            <SectionGlyph token="checklist" size={22} color={BLUE} />
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: NAVY, letterSpacing: "0.03em" }}>
                Publishing QA checklist
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5, maxWidth: 520 }}>
                {standardsDepth.publishingChecklist.length} pass/fail checks before anything goes live—covering claim, proof,
                voice, CTA intent, and measurable signals.
              </p>
            </div>
            <span
              style={{
                alignSelf: "center",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#024E70",
                background: `${BLUE}18`,
                fontFamily: SUITE_FONT_UI,
                whiteSpace: "nowrap",
              }}
            >
              Pre-publish
            </span>
          </div>
          <ul
            role="list"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              fontFamily: SUITE_FONT_UI,
            }}
          >
            {standardsDepth.publishingChecklist.map((item, index) => (
              <li
                key={`msg-check-${index}`}
                className="transition-colors hover:bg-slate-50/90"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "12px 16px",
                  borderBottom: index < standardsDepth.publishingChecklist.length - 1 ? `1px solid ${BORDER}` : undefined,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: NAVY,
                    background: `${BLUE}14`,
                    boxShadow: `inset 0 0 0 1px ${BLUE}33`,
                  }}
                >
                  {index + 1}
                </span>
                <p style={{ margin: 0, paddingTop: 4, fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="standards-visual" style={SECTION_SHELL}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionGlyph token="visual" size={18} color={BLUE} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
                Visual direction
              </p>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: MID_GRAY }}>
              Palette, type, and layout cues for {businessName}, with do/don&apos;t rows tied to your pillar and proof story.
            </p>
          </div>
          <button type="button" onClick={() => onEditInWorkbook("channel-notes")} style={EDIT_IN_WORKBOOK_BTN}>
            Edit in Workbook
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
          {paletteRows.map((row) => (
            <div key={`${row.name}-${row.hex}`} style={{ ...INNER_CARD, overflow: "hidden", padding: 0 }}>
              <div style={{ height: 40, background: row.hex }} />
              <div style={{ padding: "8px 10px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>
                  {row.name} <span style={{ color: MID_GRAY, fontWeight: 600 }}>({row.hex})</span>
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: MID_GRAY }}>
                  RGB: {row.rgb} | CMYK: {row.cmyk}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: BODY_TEXT, lineHeight: 1.5 }}>
                  {row.description}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
                  <strong style={{ color: NAVY }}>Rationale:</strong> {row.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Typography example</p>
            <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 800, color: NAVY }}>
              {businessName}: {primaryPillar} that converts {audienceShort}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: MID_GRAY, lineHeight: 1.55 }}>
              Body style for this account: {voiceAttributes.join(", ")}. Keep subcopy tied to concrete proof and next action.
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Visual composition example</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
              Imagery direction: {visualCues.imagery}<br />
              Composition direction: {visualCues.composition}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.6 }}>
              Channel application examples:
              <br />Email: {emailPlan || `Lead with ${primaryPillar.toLowerCase()} context and one concrete next step.`}
              <br />SEO/AEO: {seoAeoPlan || `Answer ${industry.toLowerCase()} buying questions with proof-first structure tied to ${firstPriority.toLowerCase()}.`}
              <br />Thought leadership: {socialPlan || `Publish recurring POV themes mapped to ${firstPriority.toLowerCase()} and ${secondPriority.toLowerCase()}.`}
            </p>
          </div>
        </div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 5,
              background: SEMANTIC_DO.bg,
              borderLeft: `3px solid ${SEMANTIC_DO.border}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DO.label, letterSpacing: "0.03em" }}>
              Visual do ({businessName})
            </p>
            <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
              {standardsDepth.visualDo.map((item, index) => (
                <p key={`visual-do-${index}`} style={{ margin: 0, fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.5 }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 5,
              background: SEMANTIC_DONT.bg,
              borderLeft: `3px solid ${SEMANTIC_DONT.border}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DONT.label, letterSpacing: "0.03em" }}>
              Visual don&apos;t ({businessName})
            </p>
            <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
              {standardsDepth.visualDont.map((item, index) => (
                <p key={`visual-dont-${index}`} style={{ margin: 0, fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.5 }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="standards-channel-do-dont" style={SECTION_SHELL}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
          Channel do / don&apos;t matrix
        </p>
        <p style={{ margin: "6px 0 10px", fontSize: 13, color: MID_GRAY, lineHeight: 1.55, maxWidth: 720 }}>
          How {businessName} should show up by channel in {industry.toLowerCase()}: each row pairs your plan (or a default tied
          to {primaryPillar.toLowerCase()}) with a concrete example—not abstract channel tips.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <PersonalizedGuidanceCard
            title="Email"
            doText={emailPlan || `Lead with one insight and one next action tied to ${firstPriority.toLowerCase()}.`}
            dontText={`Send one ${businessName} email with multiple competing offers, or bury the CTA under filler that does not reference ${topGap.toLowerCase()}.`}
            example={`${businessName} email next step: “Review your ${primaryPillar} rollout plan” after one short proof story.`}
          />
          <PersonalizedGuidanceCard
            title="SEO / AEO"
            doText={
              seoAeoPlan ||
              `Answer high-intent ${industry.toLowerCase()} questions with proof in the right place and one clear next step.`
            }
            dontText={`Publish thin ${industry.toLowerCase()} content with no way to verify ${businessName} or move to a real next step.`}
            example={`${businessName} search pages: one buyer goal per page and one path to convert.`}
          />
          <PersonalizedGuidanceCard
            title="Thought leadership / social"
            doText={socialPlan || `Use recurring POV themes tied to ${firstPriority.toLowerCase()} and ${secondPriority.toLowerCase()}.`}
            dontText={`Post opinions that never connect to how ${businessName} helps ${audienceShort} with ${topGap.toLowerCase()}.`}
            example={`${businessName} weekly format: sharp insight, proof, practical step, one next step to engage.`}
          />
        </div>
      </section>

      <section id="standards-imagery" style={SECTION_SHELL}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
          Imagery suggestions
        </p>
        <p style={{ margin: "6px 0 10px", fontSize: 13, color: MID_GRAY }}>
          Recommended image style system for campaign assets, website blocks, and social content.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Primary imagery style</p>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>
              {imageryNorm?.photography_style_direction ||
                "Use documentary-style brand imagery that shows real implementation context: strategy sessions, collaboration moments, process artifacts, and outcome-oriented visuals. Prioritize credibility over abstract stock imagery."}
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Composition and treatment</p>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>
              {imageryNorm?.color_application_in_imagery ||
                "Compose with clear focal subject + negative space for overlays. Use role-based color accents from your palette and maintain consistent contrast. Avoid over-saturated filters, heavy vignettes, and gimmick effects."}
            </p>
            {stockLines.length > 0 ? (
              <ul className="strategy-suite-ul" style={{ margin: "8px 0 0", color: BODY_TEXT, fontSize: 13, lineHeight: 1.55 }}>
                {stockLines.map((line, li) => (
                  <li key={`stock-${li}`}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 5,
                background: SEMANTIC_DO.bg,
                borderLeft: `3px solid ${SEMANTIC_DO.border}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DO.label, letterSpacing: "0.03em" }}>
                Show / Emphasize
              </p>
              {subjectShow.length > 0 ? (
                <ul className="strategy-suite-ul" style={{ margin: "5px 0 0", color: SEMANTIC_DO.text, fontSize: 13, lineHeight: 1.5 }}>
                  {subjectShow.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: "5px 0 0", fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.5 }}>
                  Real people, implementation artifacts, contextual environments, outcome dashboards, and strategic interaction scenes.
                </p>
              )}
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 5,
                background: SEMANTIC_DONT.bg,
                borderLeft: `3px solid ${SEMANTIC_DONT.border}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DONT.label, letterSpacing: "0.03em" }}>
                De-emphasize / Avoid
              </p>
              {subjectAvoid.length > 0 ? (
                <ul className="strategy-suite-ul" style={{ margin: "5px 0 0", color: SEMANTIC_DONT.text, fontSize: 13, lineHeight: 1.5 }}>
                  {subjectAvoid.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: "5px 0 0", fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.5 }}>
                  Generic handshake stock photos, staged corporate poses, low-resolution abstract textures, and unrelated lifestyle visuals.
                </p>
              )}
            </div>
          </div>
          {reportImageDonts.length > 0 ? (
            <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Imagery pitfalls (from your report)</p>
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {reportImageDonts.slice(0, 6).map((row, i) => (
                  <div
                    key={`img-dont-${i}`}
                    style={{
                      borderLeft: `3px solid ${SEMANTIC_DONT.border}`,
                      background: SEMANTIC_DONT.bg,
                      padding: "8px 10px",
                      borderRadius: 5,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: SEMANTIC_DONT.text }}>{row.dont}</p>
                    {row.why ? (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>Why: {row.why}</p>
                    ) : null}
                    {row.alternative ? (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: SEMANTIC_DO.text, lineHeight: 1.5 }}>
                        Instead: {row.alternative}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="standards-logo-direction" style={SECTION_SHELL}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
              Logo design direction
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: MID_GRAY }}>
              Usage rules from your Blueprint+ standards, plus a practical path when you do not have a final mark yet.
            </p>
          </div>
          <button type="button" onClick={() => onEditInWorkbook("channel-notes")} style={EDIT_IN_WORKBOOK_BTN}>
            Edit in Workbook
          </button>
        </div>
        <ReportCallout label="About logo files" accentColor={BLUE}>
          Wunderbar provides usage guidance; your team supplies the actual logo artwork (vector, raster, and brand-approved
          variants). If you are still pre-mark, use the interim path below until a designer delivers lockups.
        </ReportCallout>
        {hasReportLogoGuidance ? (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {reportLogoOverview ? (
              <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Overview</p>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>{reportLogoOverview}</p>
              </div>
            ) : null}
            {reportLogoClearSpace || reportLogoMinSize ? (
              <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Clear space and minimum size</p>
                {reportLogoClearSpace ? (
                  <p style={{ margin: "5px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>{reportLogoClearSpace}</p>
                ) : null}
                {reportLogoMinSize ? (
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>{reportLogoMinSize}</p>
                ) : null}
              </div>
            ) : null}
            {reportLogoPlacement.length > 0 ? (
              <div style={{ ...INNER_CARD, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Placement</p>
                <ul className="strategy-suite-ul" style={{ margin: "6px 0 0", color: BODY_TEXT, fontSize: 13, lineHeight: 1.55 }}>
                  {reportLogoPlacement.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {reportLogoIncorrect.length > 0 ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 5,
                  background: SEMANTIC_DONT.bg,
                  borderLeft: `3px solid ${SEMANTIC_DONT.border}`,
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DONT.label, letterSpacing: "0.03em" }}>
                  Misuse to avoid
                </p>
                <ul className="strategy-suite-ul" style={{ margin: "6px 0 0", color: SEMANTIC_DONT.text, fontSize: 13, lineHeight: 1.5 }}>
                  {reportLogoIncorrect.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ ...INNER_CARD, padding: "12px 14px", marginTop: 12, borderLeft: `3px solid ${BLUE}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Interim identity (no final logo yet)</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>
              Until you have an approved mark, ship a consistent <strong>wordmark</strong> using your approved type palette (
              {voiceAttributes.slice(0, 2).join(", ")}) and the color roles on this tab. Pair it with the mood board and imagery
              prompts so every surface feels cohesive while you commission a symbol or monogram.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>
              For exploration only (not legal/trademark-ready “comps”), you can use the reference prompts in{" "}
              <strong>Mood board</strong> below in tools like Midjourney or Firefly—then brief a designer with those directions
              plus this standards page.
            </p>
          </div>
        )}
        {!hasReportLogoGuidance ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 10 }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 5,
                background: SEMANTIC_DO.bg,
                borderLeft: `3px solid ${SEMANTIC_DO.border}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DO.label, letterSpacing: "0.03em" }}>
                Recommended lockups
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.5 }}>
                Horizontal wordmark for website and navigation, stacked lockup for social avatars, simple monogram or favicon
                once a designer delivers assets.
              </p>
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 5,
                background: SEMANTIC_DONT.bg,
                borderLeft: `3px solid ${SEMANTIC_DONT.border}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: SEMANTIC_DONT.label, letterSpacing: "0.03em" }}>
                Misuse to avoid
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.5 }}>
                Stretching the mark, off-palette recolor, busy backgrounds, effects inside the logo, and using unapproved
                raster sizes.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section id="standards-implementation" style={SECTION_SHELL}>
        <div className="flex flex-wrap items-start gap-3">
          <SectionGlyph token="roadmap" size={22} color={BLUE} />
          <div className="min-w-0 flex-1">
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
              Implementation examples
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: MID_GRAY, lineHeight: 1.55 }}>
              Specific ways to apply voice, messaging, and visual standards in daily execution. Sample lines use the Lato roles
              in <strong style={{ color: NAVY }}>Typography standards</strong> (headline, subhead, body, meta, CTA)—scaled to fit
              these cards.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <ImplementationExampleCard
            index={1}
            glyphToken="paid"
            eyebrow="Paid / organic social"
            title="Social refresh"
            blocks={[
              {
                specTitle: "Headline (H1 / H2)",
                role: "headline",
                content: `Fix ${topGap.toLowerCase()}. Scale ${topStrength.toLowerCase()}.`,
              },
              {
                specTitle: "Subhead (H3 / section lead)",
                role: "subhead",
                content: `${businessName} for ${audienceShort}`,
              },
              {
                specTitle: "Body copy",
                role: "body",
                content: (
                  <>
                    <p style={{ margin: "0 0 10px" }}>
                      Voice: confident and practical, with no vague claims. Messaging: one pillar-led promise, one proof point,
                      one CTA. Structure: hook line, one-sentence value statement, one proof strip (client outcome), one CTA.
                    </p>
                    <p style={{ margin: 0 }}>
                      {`${businessName} helps ${audienceShort} fix ${topGap.toLowerCase()} and scale ${topStrength.toLowerCase()} with a clear 90-day activation system.`}
                    </p>
                  </>
                ),
              },
              {
                specTitle: "CTA buttons",
                role: "cta",
                content: "See your 90-day activation plan",
              },
            ]}
          />
          <ImplementationExampleCard
            index={2}
            glyphToken="thought"
            eyebrow="Thought leadership"
            title="Post template"
            blocks={[
              {
                specTitle: "Headline (H1 / H2)",
                role: "headline",
                content: "The budget isn’t the bottleneck—clarity is.",
              },
              {
                specTitle: "Subhead (H3 / section lead)",
                role: "subhead",
                content: "Contrarian insight → evidence → practical move → CTA.",
              },
              {
                specTitle: "Body copy",
                role: "body",
                content:
                  "Voice: insight-first, no hype. Visual: one branded card with headline and one metric; avoid stock-heavy collage style.",
              },
              {
                specTitle: "Meta / captions / labels",
                role: "metaCaption",
                content: `Execution cadence: 1 post/week tied to ${firstPriority.toLowerCase()} and 1 post/week tied to ${secondPriority.toLowerCase()}.`,
              },
            ]}
          />
          <ImplementationExampleCard
            index={3}
            glyphToken="email"
            eyebrow="Sales follow-up"
            title="Email standard"
            blocks={[
              {
                specTitle: "Subhead (H3 / section lead)",
                role: "subhead",
                content: `Re: Your ${primaryPillar} rollout — recommended next step`,
              },
              {
                specTitle: "Body copy",
                role: "body",
                content:
                  "Voice: direct and supportive. Recap the diagnostic insight, add one proof reference, and recommend a single next move. Keep to four short paragraphs max with one CTA only.",
              },
              {
                specTitle: "CTA buttons",
                role: "cta",
                content: `Review your ${primaryPillar} rollout plan`,
              },
            ]}
          />
        </div>
      </section>

      <section id="standards-typography" style={SECTION_SHELL}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
          Typography standards
        </p>
        <p style={{ margin: "6px 0 10px", fontSize: 13, color: MID_GRAY, lineHeight: 1.55 }}>
          Wunderbar Digital standard: <strong style={{ color: NAVY }}>Lato</strong> for all customer-facing surfaces, with{" "}
          <span style={{ color: NAVY, fontWeight: 700 }}>navy {NAVY}</span> for authority and{" "}
          <span style={{ color: BLUE, fontWeight: 700 }}>cyan {BLUE}</span> for accents and CTAs—matching this suite and exported PDFs.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Headline (H1 / H2)</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
              Font: <strong>Lato</strong>, fallback <strong>system-ui, sans-serif</strong> | Weight: 700–800 | Color: {NAVY} | Size: 34–48px (web), 30–40px (reports)
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Subhead (H3 / section lead)</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
              Font: <strong>Lato</strong> | Weight: 600–700 | Size: 20–28px | Color: {NAVY} or {MID_GRAY} for de-emphasis
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Body Copy</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
              Font: <strong>Lato</strong> | Weight: 400–500 | Size: 15–17px | Line-height: 1.55–1.7 | Color: {BODY_TEXT} for long-form
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Meta / Captions / Labels</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
              Font: <strong>Lato</strong> | Weight: 700 for labels, 500 for metadata | Size: 11–13px | Uppercase + letter-spacing for section labels; accent {BLUE} for interactive emphasis
            </p>
          </div>
          <div style={{ ...INNER_CARD, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>CTA Buttons</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
              Font: <strong>Lato</strong> | Weight: 700 | Size: 13–15px | Fill or outline using {BLUE}; keep CTAs to 3–6 words with outcome language
            </p>
          </div>
        </div>
      </section>

      <section id="standards-moodboard" style={SECTION_SHELL}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SectionGlyph token="visual" size={18} color={BLUE} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BLUE, letterSpacing: "0.04em" }}>
                Mood board
              </p>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: MID_GRAY, maxWidth: 720, lineHeight: 1.55 }}>
              This <strong>Brand Standards</strong> section shows report-derived mood direction, optional reference thumbnails,
              and exploration prompts. HTTPS reference stills are edited in{" "}
              <strong>Workbook → Mood Board Reference Images</strong> and appear here and in exported brand standards PDFs.
            </p>
          </div>
          <button type="button" onClick={() => onEditInWorkbook("mood-board")} style={EDIT_IN_WORKBOOK_BTN}>
            Edit mood board in Workbook
          </button>
        </div>
        {visualSystemMode ? (
          <ReportCallout
            label={
              visualSystemMode === "existing"
                ? "Existing brand system"
                : visualSystemMode === "optimize"
                  ? "Existing system + optimization"
                  : "Strategic visual refresh"
            }
            accentColor={BLUE}
          >
            {visualSystemMode === "existing"
              ? "Foundation is set to preserve your current logo, palette, and typography. Use this mood board for consistency, vendor briefs, and QA—not as a signal to replace working assets. For “optimization” in the go-to-market sense, lean on ICP and persona guidance in Strategy and Foundation so creative and proof stay aligned with how priority buyers decide."
              : visualSystemMode === "optimize"
                ? "Foundation keeps your core identity while tightening execution. Pair these mood cues and channel standards with Blueprint ICP and persona outputs: optimize imagery and layout for clarity, proof, and the conversion paths each segment needs—not a wholesale rebrand."
                : "Foundation allows evolving selected visual elements. Treat prompts and samples as exploration inputs; reconcile any refresh with positioning and ICP messaging so new visuals still support priority segments. Strategy and Activation link execution to those buyer realities."}
          </ReportCallout>
        ) : (
          <p style={{ margin: "0 0 14px", fontSize: 13, color: MID_GRAY, lineHeight: 1.55, maxWidth: 720 }}>
            If you already have branding in place, choose <strong>Use existing</strong>, <strong>Optimize</strong>, or{" "}
            <strong>Refresh</strong> under Foundation (visual identity). That choice saves to your workbook and surfaces here
            so this tab matches how you want to evolve creative.
          </p>
        )}
        {hasMoodBoardFallbackFromImagery ? (
          <div style={{ ...INNER_CARD, padding: "12px 14px", marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Mood direction from your report</p>
            {photographyDirection ? (
              <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55 }}>{photographyDirection}</p>
            ) : null}
            {subjectShow.length > 0 ? (
              <>
                <p style={{ margin: "10px 0 0", fontSize: 12, fontWeight: 800, color: NAVY }}>Favor these subjects and settings</p>
                <ul className="strategy-suite-ul" style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.5 }}>
                  {subjectShow.slice(0, 8).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <p style={{ margin: "10px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.55 }}>
              Structured mood tags (keywords, textures, designer brief) appear when your report includes{" "}
              <strong>moodBoardDescriptors</strong>—included on new Blueprint reports. Blueprint+ adds AI exploration prompts.
              Full stock criteria and show/avoid lists are in <strong>Imagery Suggestions</strong> above.
            </p>
          </div>
        ) : null}
        {moodDesc ? (
          <div style={{ marginBottom: 12 }}>
            <MoodOutputsGraphic moodDesc={moodDesc} />
          </div>
        ) : null}
        {moodBoardSamples.length > 0 ? (
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", color: MID_GRAY }}>
              Reference Image Samples
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {moodBoardSamples.map((sample, index) => (
                <div key={`${sample.url}-${index}`} style={{ ...INNER_CARD, overflow: "hidden", padding: 0 }}>
                  <img
                    src={sample.url}
                    alt={sample.caption || `Mood board sample ${index + 1}`}
                    style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "8px 10px" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: NAVY }}>
                      {sample.caption || `Sample ${index + 1}`}
                    </p>
                    {sample.rationale ? (
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
                        {sample.rationale}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {aiImagePrompts.length > 0 ? (
          <div style={{ ...INNER_CARD, padding: "12px 14px", marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}>Reference prompts (exploration, not final assets)</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
              Use with your preferred image tool to explore direction; have a designer refine anything customer-facing.
            </p>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {aiImagePrompts.slice(0, 4).map((row, i) => (
                <div key={`ai-prompt-${i}`} style={{ padding: "8px 10px", borderRadius: 5, border: `1px solid ${BORDER}`, background: "#FCFDFF" }}>
                  {row.useCase ? (
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.03em" }}>
                      {row.useCase}
                    </p>
                  ) : null}
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: BODY_TEXT, lineHeight: 1.55, fontFamily: "ui-monospace, monospace" }}>
                    {row.prompt}
                  </p>
                  {row.negativePrompt ? (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
                      Avoid: {row.negativePrompt}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {!moodDesc &&
        moodBoardSamples.length === 0 &&
        aiImagePrompts.length === 0 &&
        !hasMoodBoardFallbackFromImagery ? (
          <ReportCallout label="Why this can look empty" accentColor={BLUE}>
            The mood board reads from <strong>brandImageryDirection</strong> in your report. If there is no imagery block yet
            (for example Snapshot-only data), generate or open a Blueprint report. Thumbnails need HTTPS reference URLs from{" "}
            <strong>Workbook → Mood Board Reference Images</strong>. Blueprint+ adds extra AI prompts; structured mood tags come
            from <strong>moodBoardDescriptors</strong> on new Blueprint reports.
          </ReportCallout>
        ) : moodBoardSamples.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: MID_GRAY, lineHeight: 1.55 }}>
            No image URLs on file yet. Add trusted reference links in your workbook so thumbnails can appear here and in
            exported brand standards PDFs.
          </p>
        ) : null}
      </section>
    </TabPageWithSidebar>
  );
}

