"use client";

import type { CSSProperties } from "react";
import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ExecutionSchedule, { type ScheduleRow } from "@/components/ExecutionSchedule";
import type { ProductTier } from "@/components/ResultsTabNav";
import TabPageWithSidebar from "@/components/results/TabPageWithSidebar";
import { SectionGlyph } from "@/components/results/BrandIcons";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";
import { filterActivationPlanSections } from "@/components/results/tabConfig";
import { getSuiteProgressHint } from "@/lib/copy/resultsSuiteGuidance";
import { ACTIVATION_SECTION_ICON_TOKEN, buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import {
  campaignRecommendsLeadMagnet,
  groupActivationPlanSections,
} from "@/lib/activation/activationPlanGroups";
import {
  filterActivationSectionsByTabFocus,
  isActivationAudienceJourneySectionId,
  parseActivationTabFocus,
  splitActivationSectionsByAudienceVsCampaign,
  type ActivationTabFocus,
} from "@/lib/activation/activationPlanAudienceVsCampaign";
import { buildActivationFullPlanHref } from "@/lib/activation/activationPlanLinks";
import { downloadActivationPackMarkdown } from "@/lib/activation/exportActivationPack";
import { WORKBOOK_SECTIONS, type WorkbookSectionId } from "@/lib/workbookTypes";
import { getActivationDownloadsHint } from "@/lib/tierDeliverables";
import { ExecutionChannelPlans } from "@/app/results/components/ExecutionChannelPlans";
import { ExecutionReadyDrafts } from "@/app/results/components/ExecutionReadyDrafts";
import { ExecutionPromptCards } from "@/app/results/components/ExecutionPromptCards";
import { MessagingMatrix } from "@/app/results/components/MessagingMatrix";
import type { BrandPromptContext } from "@/src/lib/prompts/promptLibrary";
import AudienceFoundationInfoTrigger from "@/components/activation/AudienceFoundationInfoTrigger";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

const LINK_BTN: CSSProperties = {
  padding: "7px 12px",
  borderRadius: 7,
  border: `1px solid ${BORDER}`,
  background: "#FFFFFF",
  color: NAVY,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Lato', sans-serif",
  textDecoration: "none",
  display: "inline-block",
  boxSizing: "border-box",
};

/** Calm surface for stacked blocks — avoids “every card is a blue gradient”. */
const PANEL_SURFACE: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  boxShadow: "0 1px 2px rgba(2, 24, 89, 0.04)",
};

const SECTION_HEAD_KICKER: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: MID_GRAY,
};

const SECTION_HEAD_TITLE: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 18,
  fontWeight: 700,
  color: NAVY,
  lineHeight: 1.25,
};

function ActivationSectionHeading({
  kicker,
  title,
  description,
  style,
}: {
  kicker: string;
  title: string;
  description?: string;
  style?: CSSProperties;
}) {
  return (
    <header style={{ marginBottom: 16, ...style }}>
      <p style={SECTION_HEAD_KICKER}>{kicker}</p>
      <h3 style={SECTION_HEAD_TITLE}>{title}</h3>
      {description ? (
        <p style={{ margin: "8px 0 0", fontSize: 13, color: MID_GRAY, lineHeight: 1.55, maxWidth: 720 }}>{description}</p>
      ) : null}
    </header>
  );
}

interface ActivationTabProps {
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  scheduleRows: ScheduleRow[];
  onExportSchedule: () => void;
  onEditInWorkbook: (sectionId: WorkbookSectionId, activationPlanId?: string) => void;
}

function clampActivationFocus(
  focus: ActivationTabFocus,
  showToggle: boolean,
  audienceCount: number,
  campaignCount: number,
): ActivationTabFocus {
  if (!showToggle) return "campaigns";
  if (focus === "audience-journey" && audienceCount === 0) return "campaigns";
  if (focus === "campaigns" && campaignCount === 0) return "audience-journey";
  return focus;
}

/** Pull obvious CTA / subject / hook lines from the playbook for quick scanning. */
function extractCampaignHookLines(body: string): string[] {
  const lines = body.split(/\n/).map((l) => l.trim());
  const out: string[] = [];
  for (const line of lines) {
    if (!line || line.length > 220) continue;
    const isBullet = /^[-•*]\s+/.test(line);
    const cleaned = line.replace(/^[-•*]\s+/, "").trim();
    if (
      /primary\s+cta|subject(\s+line)?|call\s+to\s+action|(^|\s)cta(\s|:)|\bhook\b|headline|offer:|landing|nurture\s+email|^email\s*\d+/i.test(
        cleaned,
      ) ||
      (isBullet && /cta|subject|hook|email\s*[123]|sequence|welcome|conversion/i.test(cleaned))
    ) {
      out.push(cleaned);
    }
  }
  return [...new Set(out)].slice(0, 14);
}

/** Creative / layout guidance per channel — complements visuals on the full plan page. */
function imageryAndCreativeLine(sectionId: string): string {
  const map: Record<string, string> = {
    "audience-segments": "Persona one-pagers, segment matrix, and trigger → campaign diagrams.",
    "journey-orchestration": "Stage funnel, journey map, and touchpoint timeline (see full plan for map).",
    "competitive-motion-plan": "Battle cards, comparison grids, and proof placements on high-intent pages.",
    "lead-magnet-planning": "Landing hero, lead-magnet cover, thank-you page, and nurture email headers.",
    "email-lifecycle": "Modular email sections: hero, proof block, single CTA, footer; subject-line tests.",
    "seo-aeo": "SERP snippets, FAQ blocks, diagrams, and intent-mapped page shells.",
    "paid-ads": "Static + motion ad variants, carousel frames, and matched landing hero/above-the-fold.",
    "thought-leadership": "Carousel slides, short-form video thumbnails, quote cards, and caption hooks.",
    "pr-plan": "Press headline blocks, quote callouts, and media kit / speaker visuals.",
    "execution-roadmap": "Week-phase timeline, owner grid, and schedule export for stakeholder reviews.",
  };
  return map[sectionId] ?? "Channel layouts, proof blocks, and hero treatments on the dedicated plan page.";
}

const PLAN_TABLE_TH: CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

function toPromptTier(
  tier: ProductTier,
): "snapshot" | "snapshot_plus" | "blueprint" | "blueprint_plus" {
  if (tier === "snapshot-plus") return "snapshot_plus";
  if (tier === "blueprint-plus") return "blueprint_plus";
  return tier;
}

function toPromptContext(diagnosticData: Record<string, unknown>): BrandPromptContext {
  const strategicPriorities =
    (diagnosticData.strategicPriorities as Array<{ title?: string }> | undefined) ?? [];
  const topStrengths = Array.isArray(diagnosticData.topStrengths)
    ? diagnosticData.topStrengths.map((s) => String(s)).filter(Boolean)
    : [];
  const topGaps = Array.isArray(diagnosticData.topGaps)
    ? diagnosticData.topGaps.map((s) => String(s)).filter(Boolean)
    : [];
  const voiceAttributes = Array.isArray(diagnosticData.voiceAttributes)
    ? diagnosticData.voiceAttributes.map((s) => String(s)).filter(Boolean)
    : [];
  return {
    brand_name:
      typeof diagnosticData.companyName === "string"
        ? diagnosticData.companyName
        : typeof diagnosticData.businessName === "string"
          ? diagnosticData.businessName
          : "Your Brand",
    primary_archetype:
      typeof diagnosticData.primaryArchetype === "string" ? diagnosticData.primaryArchetype : "",
    secondary_archetype:
      typeof diagnosticData.secondaryArchetype === "string" ? diagnosticData.secondaryArchetype : "",
    industry: typeof diagnosticData.industry === "string" ? diagnosticData.industry : "",
    business_type: typeof diagnosticData.industry === "string" ? diagnosticData.industry : "",
    target_audience:
      typeof diagnosticData.targetAudience === "string" ? diagnosticData.targetAudience : "",
    top_strengths: topStrengths.join(", "),
    top_gaps: topGaps.join(", "),
    recommendations: strategicPriorities.map((p) => p.title || "").filter(Boolean).join(", "),
    positioning_statement:
      typeof diagnosticData.positioningMessagingFramework === "string"
        ? diagnosticData.positioningMessagingFramework
        : "",
    voice_attributes: voiceAttributes.join(", "),
    message_pillars: strategicPriorities.map((p) => p.title || "").filter(Boolean).slice(0, 3).join(", "),
    value_proposition:
      typeof diagnosticData.topOpportunity === "string" ? diagnosticData.topOpportunity : "",
    brand_story:
      typeof diagnosticData.brandHealthVerdict === "string" ? diagnosticData.brandHealthVerdict : "",
  };
}

export default function ActivationTab({
  productTier,
  diagnosticData,
  scheduleRows,
  onExportSchedule,
  onEditInWorkbook,
}: ActivationTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const [showPlanningLayers, setShowPlanningLayers] = useState(false);
  /** Compact = scannable rows + export; detailed = full playbook scroll areas. */
  const [channelPlansLayout, setChannelPlansLayout] = useState<"compact" | "detailed">("compact");
  const activationPersonaIcpBanner =
    typeof diagnosticData.activationPersonaIcpBanner === "string"
      ? diagnosticData.activationPersonaIcpBanner.trim()
      : "";
  const reportId = typeof diagnosticData.reportId === "string" ? diagnosticData.reportId : "";
  const userEmail = typeof diagnosticData.userEmail === "string" ? diagnosticData.userEmail : "";
  const isPreviewReport =
    reportId.startsWith("preview-") ||
    reportId === "preview-results-tabs" ||
    reportId === "preview-mock";

  const activationPlanSections = buildActivationPlanSectionsList(diagnosticData, scheduleRows.length);
  const activationPlanSectionsVisible = filterActivationPlanSections(productTier, activationPlanSections);
  const { audienceJourney, campaigns: campaignSections } = useMemo(
    () => splitActivationSectionsByAudienceVsCampaign(activationPlanSectionsVisible),
    [activationPlanSectionsVisible],
  );
  const showFoundationCampaignToggle = audienceJourney.length > 0 && campaignSections.length > 0;

  const activationFocus = useMemo(() => {
    const parsed = parseActivationTabFocus(searchParams.get("activationFocus"));
    return clampActivationFocus(
      parsed,
      showFoundationCampaignToggle,
      audienceJourney.length,
      campaignSections.length,
    );
  }, [searchParamsKey, showFoundationCampaignToggle, audienceJourney.length, campaignSections.length]);

  const sectionsForTable = useMemo(() => {
    if (!showFoundationCampaignToggle) return activationPlanSectionsVisible;
    return filterActivationSectionsByTabFocus(activationPlanSectionsVisible, activationFocus);
  }, [showFoundationCampaignToggle, activationPlanSectionsVisible, activationFocus]);

  /** Deep link: `/results?...&activationPlanId=paid-ads` → scroll to that playbook row. */
  useEffect(() => {
    const raw = searchParams.get("activationPlanId");
    const planId = typeof raw === "string" ? raw.trim() : "";
    if (!planId) return;
    const targetId = `activation-${planId}`;
    const run = () => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const raf = window.requestAnimationFrame(() => {
      run();
      window.setTimeout(run, 120);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [searchParamsKey, sectionsForTable, searchParams]);

  const setActivationFocusInUrl = (next: ActivationTabFocus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "campaigns") params.delete("activationFocus");
    else params.set("activationFocus", "audience-journey");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const groupedChannelPlans = useMemo(() => groupActivationPlanSections(sectionsForTable), [sectionsForTable]);
  const groupedPlansWithStripe = useMemo(() => {
    let row = 0;
    return groupedChannelPlans.map((group) => ({
      ...group,
      sections: group.sections.map((section) => ({ section, stripeIdx: row++ })),
    }));
  }, [groupedChannelPlans]);
  const showLeadMagnetOfferPrompt = useMemo(() => campaignRecommendsLeadMagnet(diagnosticData), [diagnosticData]);
  const activationMenuItems = useMemo(() => {
    const items: Array<{ id: string; label: string; icon?: string }> = [
      { id: "activation-overview", label: "Overview", icon: "OV" },
    ];
    for (const section of sectionsForTable) {
      items.push({ id: `activation-${section.id}`, label: section.label });
    }
    if ((!showFoundationCampaignToggle || activationFocus === "campaigns") && scheduleRows.length > 0) {
      items.push({ id: "activation-spreadsheet-schedule", label: "Schedule (.xlsx)", icon: "SC" });
    }
    return items;
  }, [sectionsForTable, showFoundationCampaignToggle, activationFocus, scheduleRows.length]);

  const activationSectionNavHint = useMemo(() => {
    if (showFoundationCampaignToggle && activationFocus === "audience-journey") {
      return "Audience foundation: segments, ICP framing, journey triggers, and competitive motion. Channel playbooks are on the Campaigns segment — every campaign assumes this layer.";
    }
    if (showFoundationCampaignToggle) {
      return "Campaign playbooks (demand, authority, rollout) are separate from Audience & journey. Open foundation plans when copy references segments, ICPs, or funnel stages.";
    }
    return "Channel plans are grouped by funnel stage (who → capture → trust → ship). Use Compact for scanning; Full playbook for copy blocks. Step 3 exports the schedule.";
  }, [showFoundationCampaignToggle, activationFocus]);

  const foundationPlanAnchorLinks = useMemo(() => {
    return activationPlanSectionsVisible
      .filter((s) => isActivationAudienceJourneySectionId(s.id))
      .map((s) => {
        const href = buildActivationFullPlanHref(s.id, reportId, userEmail, isPreviewReport);
        return href ? { label: s.label, href } : null;
      })
      .filter((x): x is { label: string; href: string } => x !== null);
  }, [activationPlanSectionsVisible, reportId, userEmail, isPreviewReport]);

  const suiteProgressHint = getSuiteProgressHint(productTier, "activation");
  const downloadsHint = getActivationDownloadsHint(productTier);
  const promptTier = toPromptTier(productTier);
  const promptContext = toPromptContext(diagnosticData);
  const messagePillars =
    ((diagnosticData.strategicPriorities as Array<{ title?: string }> | undefined) ?? [])
      .map((item) => (typeof item.title === "string" ? item.title : ""))
      .filter(Boolean)
      .slice(0, 3);

  return (
    <TabPageWithSidebar
      navTitle="Activation"
      navItems={activationMenuItems}
      className="activation-tab-content"
      sectionNavHint={activationSectionNavHint}
    >
      <div
        style={{
          marginBottom: 36,
          paddingBottom: 28,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: BLUE,
          }}
        >
          Activation
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "8px 0 12px", lineHeight: 1.2 }}>
          {productTier === "blueprint-plus" ? "Channel Execution Pack" : "Activation Plan & Channel Playbooks"}
        </h2>
        {suiteProgressHint ? (
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0369A1",
              lineHeight: 1.55,
              maxWidth: 760,
              margin: "0 0 12px",
            }}
          >
            {suiteProgressHint}
          </p>
        ) : null}
        <p style={{ fontSize: 16, color: MID_GRAY, lineHeight: 1.6, maxWidth: 760, margin: "0 0 14px" }}>
          {productTier === "blueprint-plus"
            ? "Paste-ready sequences, hooks, and channel plans tied to your ICPs and personas — not a homework list. Use sections as the briefing layer for your team, then refine in Workbook."
            : "Channel-ready plans and implementation playbooks, organized by section so your team can assign owners, ship content, and track measurable progress."}
        </p>
        {activationPersonaIcpBanner ? (
          <p
            style={{
              fontSize: 13,
              color: NAVY,
              lineHeight: 1.55,
              maxWidth: 760,
              margin: "0 0 14px",
              padding: "12px 14px",
              borderRadius: 8,
              background: "#F8FAFC",
              border: `1px solid ${BORDER}`,
            }}
          >
            {activationPersonaIcpBanner}
          </p>
        ) : null}
        <p style={{ fontSize: 13, color: "#2D3A4A", lineHeight: 1.55, maxWidth: 760, margin: 0 }}>
          <span style={{ color: MID_GRAY }}>
            Plans match your tier
            {productTier === "snapshot-plus"
              ? " (Snapshot+)"
              : productTier === "blueprint"
                ? " (Blueprint)"
                : productTier === "blueprint-plus"
                  ? " (Blueprint+)"
                  : ""}
            .{" "}
          </span>
          Each plan opens on its own page for print/PDF. Prompt packs live in Workbook. {downloadsHint}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {productTier !== "snapshot" ? (
            <button
              type="button"
              onClick={() => setShowPlanningLayers((v) => !v)}
              style={{
                ...LINK_BTN,
                background: showPlanningLayers ? "#E8F6FE" : "#FFFFFF",
                borderColor: showPlanningLayers ? BLUE : BORDER,
              }}
            >
              {showPlanningLayers ? "Hide strategy layers" : "Show strategy layers"}
            </button>
          ) : null}
        </div>
      </div>
      <section id="activation-overview" style={{ scrollMarginTop: 120, marginBottom: 40 }}>
        <ActivationSectionHeading
          kicker="Step 1"
          title={productTier === "blueprint-plus" ? "What you’re shipping" : "How to use this tab"}
          description="Skim the overview, open each channel plan on its own page when you need the full brief, then refine and save in Workbook."
        />
        <div
          style={{
            ...PANEL_SURFACE,
            padding: "18px 20px",
            display: "grid",
            gap: 10,
            borderLeft: `3px solid ${NAVY}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "#2D3A4A", lineHeight: 1.55, fontWeight: 600 }}>
            {productTier === "blueprint-plus"
              ? "The same channel intelligence as your PDFs — surfaced here so you can copy lines, brief agencies, and align media without re-deriving strategy."
              : "Each channel row below links to a focused plan page with full narrative and exports. Use Workbook to refine, save versions, and run prompts from the Prompt library."}
          </p>
        </div>
      </section>

      {productTier !== "snapshot" && showPlanningLayers && (
        <section style={{ marginBottom: 40, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
          <ActivationSectionHeading
            kicker="Strategy layers"
            title="Messaging, drafts, and prompts"
            description="Optional depth: matrix filters, ready-to-run drafts, and prompt cards. Collapse with “Hide strategy layers” when you only need channel plans."
          />
          <div style={{ marginBottom: 16 }}>
            <MessagingMatrix productTier={promptTier} diagnosticData={diagnosticData} />
          </div>
          <div
            style={{
              ...PANEL_SURFACE,
              marginBottom: 16,
              padding: "14px 16px",
              borderLeft: `3px solid ${BLUE}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: NAVY, fontWeight: 700 }}>Execution-ready assets</p>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.55 }}>
              Generated from your brand context and tier. Copy, run, and refine in Workbook.
            </p>
          </div>
          {showLeadMagnetOfferPrompt ? (
            productTier === "blueprint-plus" ? (
              <div
                style={{
                  ...PANEL_SURFACE,
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderLeft: `3px solid #059669`,
                  background: "#F0FDF4",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NAVY }}>Offer or lead magnet in your plan</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.55 }}>
                  Your report includes lead-magnet or gated-offer language. Prompt <strong>LM1 — Lead Magnet &amp; Offer Builder</strong>{" "}
                  appears below with your channel notes pre-filled — use it to draft the asset, landing page, and nurture
                  bridge in one pass.
                </p>
              </div>
            ) : (
              <div
                style={{
                  ...PANEL_SURFACE,
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderLeft: `3px solid ${BORDER}`,
                  background: "#FAFBFC",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NAVY }}>Lead magnets &amp; offers detected</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.55 }}>
                  Your channel copy points at gated assets or downloads. On <strong>Blueprint+</strong>, prompt{" "}
                  <strong>LM1</strong> appears in the list below (locked until you upgrade) to generate a full offer package,
                  landing copy, and nurture outline.
                </p>
              </div>
            )
          ) : null}
          <div style={{ display: "grid", gap: 16 }}>
            <ExecutionReadyDrafts
              productTier={promptTier}
              brandContext={promptContext}
              messagePillars={messagePillars}
            />
            <ExecutionChannelPlans
              productTier={promptTier}
              archetype={
                typeof diagnosticData.primaryArchetype === "string"
                  ? diagnosticData.primaryArchetype
                  : null
              }
              messagePillars={messagePillars}
            />
            <ExecutionPromptCards
              brandContext={promptContext}
              productTier={promptTier}
              includeLeadMagnetOfferPrompt={showLeadMagnetOfferPrompt}
            />
          </div>
        </section>
      )}

      <section style={{ marginBottom: scheduleRows.length > 0 && (!showFoundationCampaignToggle || activationFocus === "campaigns") ? 40 : 0 }}>
        <ActivationSectionHeading
          kicker="Step 2"
          title={
            showFoundationCampaignToggle && activationFocus === "audience-journey"
              ? "Audience, ICP & journey foundation"
              : "Channel & campaign playbooks"
          }
          description={
            showFoundationCampaignToggle && activationFocus === "audience-journey"
              ? channelPlansLayout === "compact"
                ? "Who you are selling to, how they move through the funnel, and how you win vs alternatives. Channel plans on the Campaigns segment build on this layer."
                : "Foundation narrative and structured panels (segments, journey map, competitive motion). Switch to Campaigns for email, paid, SEO, PR, and rollout."
              : channelPlansLayout === "compact"
                ? "Demand, authority, and execution playbooks — grouped by stage. Each row links to a full brief. When copy references segments or journey stages, use Audience & journey."
                : "Full text from your report lives in the middle column. Right column surfaces creative direction and any subject/CTA lines we could parse. Open plan for diagrams or print."
          }
        />
        {showFoundationCampaignToggle ? (
          <div
            role="tablist"
            aria-label="Activation plan segments"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activationFocus === "audience-journey"}
              onClick={() => setActivationFocusInUrl("audience-journey")}
              style={{
                ...LINK_BTN,
                background: activationFocus === "audience-journey" ? "#E8F6FE" : "#FFFFFF",
                borderColor: activationFocus === "audience-journey" ? BLUE : BORDER,
              }}
            >
              Audience &amp; journey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activationFocus === "campaigns"}
              onClick={() => setActivationFocusInUrl("campaigns")}
              style={{
                ...LINK_BTN,
                background: activationFocus === "campaigns" ? "#E8F6FE" : "#FFFFFF",
                borderColor: activationFocus === "campaigns" ? BLUE : BORDER,
              }}
            >
              Campaign playbooks
            </button>
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: MID_GRAY, marginRight: 4 }}>View:</span>
          <button
            type="button"
            onClick={() => setChannelPlansLayout("compact")}
            style={{
              ...LINK_BTN,
              background: channelPlansLayout === "compact" ? "#E8F6FE" : "#FFFFFF",
              borderColor: channelPlansLayout === "compact" ? BLUE : BORDER,
            }}
          >
            Compact table
          </button>
          <button
            type="button"
            onClick={() => setChannelPlansLayout("detailed")}
            style={{
              ...LINK_BTN,
              background: channelPlansLayout === "detailed" ? "#E8F6FE" : "#FFFFFF",
              borderColor: channelPlansLayout === "detailed" ? BLUE : BORDER,
            }}
          >
            Full playbook
          </button>
          {activationPlanSectionsVisible.length > 0 ? (
            <button
              type="button"
              onClick={() =>
                downloadActivationPackMarkdown(activationPlanSectionsVisible, {
                  companyName:
                    typeof diagnosticData.companyName === "string"
                      ? diagnosticData.companyName
                      : typeof diagnosticData.businessName === "string"
                        ? diagnosticData.businessName
                        : undefined,
                  reportId: reportId || undefined,
                })
              }
              style={{
                ...LINK_BTN,
                marginLeft: "auto",
                background: NAVY,
                color: "#FFFFFF",
                borderColor: NAVY,
              }}
            >
              Download activation pack (.md)
            </button>
          ) : null}
        </div>
        <div
          style={{
            overflowX: "auto",
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            background: "#FFFFFF",
            boxShadow: "0 1px 2px rgba(2, 24, 89, 0.04)",
          }}
        >
          {channelPlansLayout === "compact" ? (
            <table
              style={{
                width: "100%",
                minWidth: 640,
                borderCollapse: "collapse",
                fontSize: 13,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: NAVY }}>
                  <th scope="col" style={{ ...PLAN_TABLE_TH, width: "22%", minWidth: 140 }}>
                    Playbook
                  </th>
                  <th scope="col" style={{ ...PLAN_TABLE_TH, whiteSpace: "normal", minWidth: 260 }}>
                    At a glance
                  </th>
                  <th scope="col" style={{ ...PLAN_TABLE_TH, width: "14%", minWidth: 100 }}>
                    Refine
                  </th>
                  <th scope="col" style={{ ...PLAN_TABLE_TH, width: "20%", minWidth: 120 }}>
                    Next step
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedPlansWithStripe.map((group) => (
                  <Fragment key={group.id}>
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: "10px 14px",
                          background: "linear-gradient(90deg, #E0F2FE 0%, #F8FCFF 100%)",
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: NAVY, letterSpacing: "0.02em" }}>
                          {group.title}
                        </p>
                        <p style={{ margin: "5px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.45 }}>{group.hint}</p>
                      </td>
                    </tr>
                    {group.sections.map(({ section, stripeIdx }) => {
                  const fullPlanHref = buildActivationFullPlanHref(section.id, reportId, userEmail, isPreviewReport);
                  const iconToken = ACTIVATION_SECTION_ICON_TOKEN[section.id] || "channel";
                  const rowBg = stripeIdx % 2 === 0 ? "#FFFFFF" : "#F7F9FC";
                  return (
                    <tr
                      key={section.id}
                      id={`activation-${section.id}`}
                      style={{
                        scrollMarginTop: 120,
                        backgroundColor: rowBg,
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 12px",
                          verticalAlign: "top",
                          borderRight: `1px solid ${BORDER}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: "#F0F9FF",
                              border: `1px solid ${BORDER}`,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                            aria-hidden
                          >
                            <SectionGlyph token={iconToken} size={18} color={BLUE} />
                          </span>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: 1.35 }}>
                            {section.label}
                          </p>
                          {!isActivationAudienceJourneySectionId(section.id) && foundationPlanAnchorLinks.length > 0 ? (
                            <div style={{ marginTop: 8 }}>
                              <AudienceFoundationInfoTrigger links={foundationPlanAnchorLinks} variant="compact" />
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          verticalAlign: "top",
                          borderRight: `1px solid ${BORDER}`,
                          color: "#2D3A4A",
                          lineHeight: 1.5,
                          fontSize: 13,
                        }}
                      >
                        <p style={{ margin: 0 }}>{section.summary}</p>
                        {!isActivationAudienceJourneySectionId(section.id) ? (
                          <p style={{ margin: "10px 0 0", fontSize: 11, color: MID_GRAY, lineHeight: 1.45 }}>
                            Diagrams and journey context appear on <strong style={{ color: NAVY }}>Open plan</strong>.
                          </p>
                        ) : null}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          verticalAlign: "top",
                          borderRight: `1px solid ${BORDER}`,
                          fontSize: 12,
                          color: MID_GRAY,
                        }}
                      >
                        {WORKBOOK_SECTIONS.find((w) => w.id === section.workbookSectionId)?.label ??
                          section.workbookSectionId.replace(/-/g, " ")}
                      </td>
                      <td style={{ padding: "12px 12px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                          {fullPlanHref ? (
                            <Link
                              href={fullPlanHref}
                              style={{
                                ...LINK_BTN,
                                background: NAVY,
                                color: "#FFFFFF",
                                borderColor: NAVY,
                                textAlign: "center",
                                minWidth: 108,
                                fontSize: 11,
                                padding: "6px 10px",
                              }}
                            >
                              Open plan
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => onEditInWorkbook(section.workbookSectionId, section.id)}
                            style={{ ...LINK_BTN, minWidth: 108, textAlign: "center", fontSize: 11, padding: "6px 10px" }}
                          >
                            Edit in Workbook
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          ) : (
          <table
            style={{
              width: "100%",
              minWidth: 960,
              borderCollapse: "collapse",
              fontSize: 13,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                <th scope="col" style={{ ...PLAN_TABLE_TH, width: "16%", minWidth: 148 }}>
                  Playbook
                </th>
                <th scope="col" style={{ ...PLAN_TABLE_TH, whiteSpace: "normal", minWidth: 280 }}>
                  What to execute
                </th>
                <th scope="col" style={{ ...PLAN_TABLE_TH, whiteSpace: "normal", minWidth: 220 }}>
                  Creative &amp; hooks
                </th>
                <th scope="col" style={{ ...PLAN_TABLE_TH, width: "18%", minWidth: 132 }}>
                  Next step
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedPlansWithStripe.map((group) => (
                <Fragment key={`d-${group.id}`}>
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "11px 14px",
                        background: "linear-gradient(90deg, #E0F2FE 0%, #F8FCFF 100%)",
                        borderBottom: `1px solid ${BORDER}`,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: NAVY }}>{group.title}</p>
                      <p style={{ margin: "5px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.45 }}>{group.hint}</p>
                    </td>
                  </tr>
                  {group.sections.map(({ section, stripeIdx }) => {
                const fullPlanHref = buildActivationFullPlanHref(section.id, reportId, userEmail, isPreviewReport);
                const iconToken = ACTIVATION_SECTION_ICON_TOKEN[section.id] || "channel";
                const hookLines = extractCampaignHookLines(section.body);
                const rowBg = stripeIdx % 2 === 0 ? "#FFFFFF" : "#F7F9FC";
                return (
                  <tr
                    key={section.id}
                    id={`activation-${section.id}`}
                    style={{
                      scrollMarginTop: 120,
                      backgroundColor: rowBg,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 12px",
                        verticalAlign: "top",
                        borderRight: `1px solid ${BORDER}`,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                        <span
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: "#F0F9FF",
                            border: `1px solid ${BORDER}`,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                          aria-hidden
                        >
                          <SectionGlyph token={iconToken} size={22} color={BLUE} />
                        </span>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY, lineHeight: 1.35 }}>
                          {section.label}
                        </p>
                        {!isActivationAudienceJourneySectionId(section.id) && foundationPlanAnchorLinks.length > 0 ? (
                          <div style={{ marginTop: 8 }}>
                            <AudienceFoundationInfoTrigger links={foundationPlanAnchorLinks} variant="compact" />
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        verticalAlign: "top",
                        borderRight: `1px solid ${BORDER}`,
                        maxWidth: 420,
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 700, color: "#2D3A4A", lineHeight: 1.5 }}>{section.summary}</p>
                      {!isActivationAudienceJourneySectionId(section.id) ? (
                        <p style={{ margin: "8px 0 0", fontSize: 11, color: MID_GRAY, lineHeight: 1.45 }}>
                          Flow diagrams and journey map live on <strong style={{ color: NAVY }}>Open plan</strong> for this channel.
                        </p>
                      ) : null}
                      <p style={{ margin: "6px 0 8px", fontSize: 11, fontWeight: 700, color: MID_GRAY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Full playbook text
                      </p>
                      <div
                        style={{
                          maxHeight: 320,
                          overflowY: "auto",
                          padding: "12px 14px",
                          background: "#F8FAFC",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#1e293b",
                          lineHeight: 1.55,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {section.body.trim() || "—"}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 12px",
                        verticalAlign: "top",
                        borderRight: `1px solid ${BORDER}`,
                        maxWidth: 300,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: MID_GRAY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Suggested visuals
                      </p>
                      <p style={{ margin: "6px 0 14px", fontSize: 12, color: "#2D3A4A", lineHeight: 1.5 }}>
                        {imageryAndCreativeLine(section.id)}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: MID_GRAY, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Hooks &amp; CTAs
                      </p>
                      {hookLines.length > 0 ? (
                        <ul
                          style={{
                            margin: "8px 0 0",
                            paddingLeft: 18,
                            fontSize: 12,
                            color: MID_GRAY,
                            lineHeight: 1.45,
                          }}
                        >
                          {hookLines.map((line, hookIdx) => (
                            <li key={hookIdx} style={{ marginBottom: 4 }}>
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: "8px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.45 }}>
                          No CTA/subject lines matched our parser — the playbook column still has full copy. Open plan for
                          diagrams (funnel, journey, etc.).
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                        {fullPlanHref ? (
                          <Link
                            href={fullPlanHref}
                            style={{
                              ...LINK_BTN,
                              background: NAVY,
                              color: "#FFFFFF",
                              borderColor: NAVY,
                              textAlign: "center",
                              minWidth: 118,
                            }}
                          >
                            Open plan
                          </Link>
                        ) : (
                          <span style={{ fontSize: 12, color: MID_GRAY, fontWeight: 600 }}>Add report id</span>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditInWorkbook(section.workbookSectionId, section.id)}
                          style={{ ...LINK_BTN, minWidth: 118, textAlign: "center" }}
                        >
                          Edit in Workbook
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
          )}
        </div>
        <p style={{ fontSize: 12, color: MID_GRAY, marginTop: 14, lineHeight: 1.5, maxWidth: 900 }}>
          <strong style={{ color: NAVY }}>Blueprint+:</strong> These playbooks pull from your generated report (email
          frameworks, SEO/AEO, paid/social/PR, journey map, competitive positioning, lead magnet / conversion strategy, and
          90-day roadmap)—not generic worksheets. If a block is empty in your export, regenerate or check the downloadable
          PDF. <strong style={{ color: NAVY }}>Diagrams</strong> (journey map, funnel, timelines, offer flow, and more) appear on each channel’s{" "}
          <strong>Open plan</strong> page.
        </p>
      </section>

      {scheduleRows.length > 0 && (!showFoundationCampaignToggle || activationFocus === "campaigns") && (
        <section
          id="activation-spreadsheet-schedule"
          style={{
            scrollMarginTop: 160,
            marginTop: 36,
            paddingTop: 28,
            borderTop: `2px solid ${BORDER}`,
          }}
        >
          <ActivationSectionHeading
            kicker="Step 3"
            title="Activation schedule (spreadsheet)"
            description="Exportable .xlsx — separate from the 90-day narrative roadmap in Step 2. Preview shows the first 12 rows; get the full file from Downloads or below."
          />
          <ExecutionSchedule rows={scheduleRows} onExportClick={onExportSchedule} showHeading={false} />
        </section>
      )}
    </TabPageWithSidebar>
  );
}
