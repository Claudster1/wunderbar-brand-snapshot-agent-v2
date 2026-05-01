"use client";

import { useMemo } from "react";
import type { ProductTier } from "@/components/ResultsTabNav";
import TabPageWithSidebar from "@/components/results/TabPageWithSidebar";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_SM,
} from "@/components/results/suiteBrandTokens";
import { getSuiteProgressHint } from "@/lib/copy/resultsSuiteGuidance";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const AMBER = "#D97706";
const BORDER = SUITE_BORDER;
const LIGHT = "#F7F9FC";

const DOWNLOADS_NAV_ITEMS = [
  { id: "downloads-overview", label: "Overview", icon: "OV" },
  { id: "downloads-core", label: "Core", icon: "CO" },
  { id: "downloads-strategy", label: "Strategy", icon: "ST" },
  { id: "downloads-activation", label: "Activation", icon: "AC" },
  { id: "downloads-role-packs", label: "Role Packs", icon: "RP" },
];

type DocumentId =
  | "snapshot-report"
  | "executive-summary"
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
  | "prompt-guide"
  | "role-pack-leadership"
  | "role-pack-marketing"
  | "role-pack-sales"
  | "role-pack-design";

type GenerationType = "static" | "workbook-linked";
type FileFormat = "pdf" | "xlsx" | "zip";

interface DocumentDef {
  id: DocumentId;
  label: string;
  description: string;
  format: FileFormat;
  generationType: GenerationType;
  availableFrom: ProductTier;
  workbookSections?: string[];
  group: "core" | "strategy" | "activation" | "role-packs";
}

const DOCUMENT_DEFS: DocumentDef[] = [
  {
    id: "snapshot-report",
    label: "Snapshot Report PDF",
    description: "Your current diagnostic report export.",
    format: "pdf",
    generationType: "static",
    availableFrom: "snapshot",
    group: "core",
  },
  {
    id: "executive-summary",
    label: "Executive Summary",
    description: "One-page synthesis for leadership and partners.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "snapshot-plus",
    workbookSections: ["positioning-statement", "brand-story"],
    group: "core",
  },
  {
    id: "prompt-guide",
    label: "Prompt Guide",
    description: "All prompts pre-filled from your brand context.",
    format: "pdf",
    generationType: "static",
    availableFrom: "snapshot-plus",
    group: "core",
  },
  {
    id: "brand-strategy",
    label: "Brand Strategy PDF",
    description: "Archetype, messaging, voice, and differentiation guidance.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: ["positioning-statement", "messaging-framework", "voice-attributes"],
    group: "strategy",
  },
  {
    id: "icp-conversion-snapshot",
    label: "ICP Conversion Snapshot",
    description:
      "Blueprint quickview: ICP conversion barriers, top hooks, and stage-level CTA guidance.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: ["messaging-framework", "persona-atlas", "buyer-journey-map"],
    group: "strategy",
  },
  {
    id: "icp-conversion-intelligence-framework",
    label: "ICP Conversion Intelligence Framework",
    description:
      "Performance optimization backbone linking ICP-tier conversion logic to channel execution.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["messaging-framework", "icp-conversion-intelligence", "channel-notes", "action-plan"],
    group: "strategy",
  },
  {
    id: "brand-standards-internal",
    label: "Internal Brand Master Guide",
    description: "Internal source-of-truth standards for cross-functional team execution.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: [
      "positioning-statement",
      "messaging-framework",
      "voice-attributes",
      "channel-notes",
      "mood-board",
      "action-plan",
    ],
    group: "strategy",
  },
  {
    id: "brand-standards-external",
    label: "External Brand Guide",
    description: "Shareable standards for agencies, freelancers, and external collaborators.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: ["messaging-framework", "voice-attributes", "channel-notes", "mood-board"],
    group: "strategy",
  },
  {
    id: "brand-standards-vendor-spec",
    label: "Partner & Vendor Spec Sheet",
    description: "Production-ready logo/color/type and file format specs for partners.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: ["voice-attributes", "channel-notes"],
    group: "strategy",
  },
  {
    id: "sales-battle-cards",
    label: "Sales Battle Cards",
    description: "Competitive response and differentiation cards for frontline sales use.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["positioning-statement", "messaging-framework"],
    group: "strategy",
  },
  {
    id: "one-page-messaging",
    label: "One-Page Messaging",
    description: "Condensed pillar and proof-point reference sheet.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: ["messaging-framework"],
    group: "strategy",
  },
  {
    id: "voice-checklist",
    label: "Voice Checklist",
    description: "Quick QA checklist before publishing.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: ["voice-attributes"],
    group: "strategy",
  },
  {
    id: "activation-plan",
    label: "Activation Plan PDF",
    description: "Priorities, channel plans, prompts, and operational sequencing.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["channel-notes", "action-plan"],
    group: "activation",
  },
  {
    id: "digital-marketing-strategy",
    label: "Digital Marketing Strategy",
    description: "Channel-by-channel digital strategy with tactical guidance.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["channel-notes", "action-plan"],
    group: "activation",
  },
  {
    id: "competitive-intelligence-brief",
    label: "Competitive Intelligence Brief",
    description: "Competitive landscape, positioning pressure, and response strategy.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["positioning-statement", "action-plan"],
    group: "activation",
  },
  {
    id: "activation-schedule",
    label: "Activation Schedule",
    description: "90-day schedule spreadsheet for owners and due dates.",
    format: "xlsx",
    generationType: "static",
    availableFrom: "blueprint",
    group: "activation",
  },
  {
    id: "strategic-action-plan",
    label: "Strategic Action Plan",
    description: "Prioritized 90-day roadmap with dependencies.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["action-plan"],
    group: "activation",
  },
  {
    id: "brand-playbook",
    label: "Brand Playbook — Full Report",
    description: "Comprehensive strategy + activation reference document.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint",
    workbookSections: [
      "positioning-statement",
      "messaging-framework",
      "voice-attributes",
      "brand-story",
      "audience-profile",
      "channel-notes",
      "mood-board",
      "action-plan",
    ],
    group: "core",
  },
  {
    id: "role-pack-leadership",
    label: "Leadership Pack",
    description: "Board-ready summary and strategic implications.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["positioning-statement", "brand-story"],
    group: "role-packs",
  },
  {
    id: "role-pack-marketing",
    label: "Marketing Pack",
    description: "Messaging, voice, channel plan, prompts, schedule.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["messaging-framework", "voice-attributes", "channel-notes"],
    group: "role-packs",
  },
  {
    id: "role-pack-sales",
    label: "Sales Battle Cards",
    description: "Positioning, value proposition, objections, and proof.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["positioning-statement", "messaging-framework"],
    group: "role-packs",
  },
  {
    id: "role-pack-design",
    label: "Design Pack",
    description: "Visual and verbal guardrails for creative teams.",
    format: "pdf",
    generationType: "workbook-linked",
    availableFrom: "blueprint-plus",
    workbookSections: ["voice-attributes", "mood-board"],
    group: "role-packs",
  },
];

const GROUP_LABELS = {
  core: "Core Documents",
  strategy: "Brand Strategy",
  activation: "Activation & Execution",
  "role-packs": "Role-Based Packs",
} as const;

const SECTION_LABELS: Record<string, string> = {
  "positioning-statement": "Positioning Statement",
  "messaging-framework": "Messaging Framework",
  "voice-attributes": "Voice & Tone",
  "brand-story": "Brand Story",
  "audience-profile": "Audience Profile",
  "persona-atlas": "Persona Atlas",
  "buyer-journey-map": "Buyer Journey Map",
  "competitive-landscape-matrix": "Competitive Landscape Matrix",
  "channel-notes": "Channel Strategy & Activation Notes",
  "mood-board": "Mood Board Reference Images",
  "action-plan": "Strategic Action Plan",
  "prompt-outputs": "Prompt Outputs",
  "icp-conversion-intelligence": "ICP Conversion Intelligence",
};

const TIER_RANK: Record<ProductTier, number> = {
  snapshot: 0,
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

const DOWNLOADS_GROUPS: Array<"core" | "strategy" | "activation" | "role-packs"> = [
  "core",
  "strategy",
  "activation",
  "role-packs",
];

/** Shared by `ResultsTabsShell` (chips) and `DownloadsTab` — keep nav ids aligned with on-page anchors. */
export function buildDownloadsNavModel(productTier: ProductTier): {
  navItems: (typeof DOWNLOADS_NAV_ITEMS)[number][];
  sidebarGroups: Array<{ label: string; items: (typeof DOWNLOADS_NAV_ITEMS)[number][] }>;
} {
  const tierRank = TIER_RANK[productTier] ?? 0;
  const availableDocs = DOCUMENT_DEFS.filter((doc) => TIER_RANK[doc.availableFrom] <= tierRank);
  const downloadsNavItems = [
    DOWNLOADS_NAV_ITEMS[0],
    ...DOWNLOADS_GROUPS.map((group) => {
      const count = availableDocs.filter((doc) => doc.group === group).length;
      if (count === 0) return null;
      const item = DOWNLOADS_NAV_ITEMS.find(
        (nav) =>
          (group === "core" && nav.id === "downloads-core") ||
          (group === "strategy" && nav.id === "downloads-strategy") ||
          (group === "activation" && nav.id === "downloads-activation") ||
          (group === "role-packs" && nav.id === "downloads-role-packs"),
      );
      return item ?? null;
    }).filter(Boolean),
  ] as typeof DOWNLOADS_NAV_ITEMS;

  const sidebarGroups: Array<{ label: string; items: (typeof DOWNLOADS_NAV_ITEMS)[number][] }> = [
    { label: "Overview", items: [DOWNLOADS_NAV_ITEMS[0]] },
  ];
  for (const groupKey of DOWNLOADS_GROUPS) {
    const groupDocs = availableDocs.filter((doc) => doc.group === groupKey);
    if (groupDocs.length === 0) continue;
    const navItem = DOWNLOADS_NAV_ITEMS.find(
      (nav) =>
        (groupKey === "core" && nav.id === "downloads-core") ||
        (groupKey === "strategy" && nav.id === "downloads-strategy") ||
        (groupKey === "activation" && nav.id === "downloads-activation") ||
        (groupKey === "role-packs" && nav.id === "downloads-role-packs"),
    );
    if (navItem) sidebarGroups.push({ label: GROUP_LABELS[groupKey], items: [navItem] });
  }
  return { navItems: downloadsNavItems, sidebarGroups };
}

export interface DocumentTileState {
  documentId: DocumentId;
  lastGeneratedAt?: string;
  needsRegeneration: boolean;
  lifecycleState?: "draft" | "in_review" | "published" | "stale" | "archived";
}

interface DownloadsTabProps {
  productTier: ProductTier;
  documentStates: DocumentTileState[];
  onDownload: (documentId: DocumentId) => void;
  onGenerate: (documentId: DocumentId) => Promise<void>;
  onDownloadAll?: () => void;
  shellRendersSectionChips?: boolean;
  shellActiveSectionId?: string | null;
}

function DocumentTile({
  doc,
  state,
  onDownload,
  onGenerate,
}: {
  doc: DocumentDef;
  state: DocumentTileState | undefined;
  onDownload: (id: DocumentId) => void;
  onGenerate: (id: DocumentId) => Promise<void>;
}) {
  const hasGenerated = Boolean(state?.lastGeneratedAt);
  const needsRegen = state?.needsRegeneration ?? false;
  const isWorkbookLinked = doc.generationType === "workbook-linked";
  const lifecycle = state?.lifecycleState || "draft";
  const formatLabel: Record<FileFormat, string> = {
    pdf: "PDF",
    xlsx: "Excel",
    zip: "ZIP",
  };

  const lastGenText = state?.lastGeneratedAt
    ? `Last generated ${new Date(state.lastGeneratedAt).toLocaleDateString()}`
    : isWorkbookLinked
      ? "Not yet generated"
      : "Ready to download";
  const lifecycleLabelMap: Record<NonNullable<DocumentTileState["lifecycleState"]>, string> = {
    draft: "Draft",
    in_review: "In Review",
    published: "Published",
    stale: "Stale",
    archived: "Archived",
  };
  const lifecycleColorMap: Record<NonNullable<DocumentTileState["lifecycleState"]>, { bg: string; text: string }> = {
    draft: { bg: "#EFF6FF", text: "#1D4ED8" },
    in_review: { bg: "#FEF3C7", text: "#92400E" },
    published: { bg: "#ECFDF3", text: "#166534" },
    stale: { bg: "#FEF2F2", text: "#B91C1C" },
    archived: { bg: "#F1F5F9", text: "#475569" },
  };

  return (
    <div
      style={{
        padding: "20px 22px",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
        border: `1px solid ${BORDER}`,
        borderLeft: `4px solid ${BLUE}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 20px rgba(2,24,89,0.05)",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{doc.label}</span>
          <span style={{ padding: "1px 8px", borderRadius: SUITE_RADIUS_SM, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em", backgroundColor: LIGHT, color: MID_GRAY }}>
            {formatLabel[doc.format]}
          </span>
          <span
            style={{
              padding: "1px 8px",
              borderRadius: SUITE_RADIUS_SM,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.03em",
              backgroundColor: lifecycleColorMap[lifecycle].bg,
              color: lifecycleColorMap[lifecycle].text,
            }}
          >
            {lifecycleLabelMap[lifecycle]}
          </span>
          {isWorkbookLinked && (
            <span style={{ padding: "1px 8px", borderRadius: SUITE_RADIUS_SM, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em", backgroundColor: "#E8F6FE", color: BLUE }}>
              Workbook-Linked
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: MID_GRAY, lineHeight: 1.5, margin: 0 }}>{doc.description}</p>
        {doc.workbookSections && doc.workbookSections.length > 0 ? (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {doc.workbookSections.slice(0, 5).map((sectionId) => (
              <span
                key={`${doc.id}-${sectionId}`}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: NAVY,
                  backgroundColor: "#EEF7FF",
                  border: "1px solid #CFE6FA",
                  borderRadius: 999,
                  padding: "3px 8px",
                  letterSpacing: "0.02em",
                }}
              >
                {SECTION_LABELS[sectionId] ?? sectionId}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: needsRegen ? AMBER : "#94A3B8" }}>{lastGenText}</span>
        {needsRegen && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: AMBER, backgroundColor: "#FEF3C7", padding: "2px 8px", borderRadius: SUITE_RADIUS_SM }}>
            Updated since last generation
          </span>
        )}
      </div>
      {isWorkbookLinked && (!hasGenerated || needsRegen) ? (
        <button onClick={() => onGenerate(doc.id)} style={{ padding: "10px 16px", backgroundColor: needsRegen ? AMBER : BLUE, color: "#ffffff", border: "none", borderRadius: SUITE_RADIUS_BUTTON, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: SUITE_FONT_UI, alignSelf: "flex-start" }}>
          {needsRegen ? "Regenerate & Download" : "Generate & Download"}
        </button>
      ) : (
        <button onClick={() => onDownload(doc.id)} style={{ padding: "10px 16px", backgroundColor: BLUE, color: "#ffffff", border: "none", borderRadius: SUITE_RADIUS_BUTTON, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: SUITE_FONT_UI, alignSelf: "flex-start" }}>
          Download
        </button>
      )}
    </div>
  );
}

export default function DownloadsTab({
  productTier,
  documentStates,
  onDownload,
  onGenerate,
  onDownloadAll,
  shellRendersSectionChips = false,
  shellActiveSectionId = null,
}: DownloadsTabProps) {
  const tierRank = TIER_RANK[productTier] ?? 0;
  const isBlueprintPlus = productTier === "blueprint-plus";
  const availableDocs = DOCUMENT_DEFS.filter((doc) => TIER_RANK[doc.availableFrom] <= tierRank);
  const stateMap = Object.fromEntries(
    documentStates.map((state) => [state.documentId, state]),
  ) as Record<DocumentId, DocumentTileState | undefined>;
  const docsNeedingRegen = availableDocs.filter((doc) => stateMap[doc.id]?.needsRegeneration).length;

  const { navItems: downloadsNavItems, sidebarGroups: downloadsSidebarGroups } = useMemo(
    () => buildDownloadsNavModel(productTier),
    [productTier],
  );

  const suiteProgressHint = getSuiteProgressHint(productTier, "downloads");

  return (
    <TabPageWithSidebar
      navTitle="Downloads"
      navItems={downloadsNavItems}
      sidebarGroups={downloadsSidebarGroups}
      shellRendersSectionChips={shellRendersSectionChips}
      shellActiveSectionId={shellActiveSectionId}
    >
      <div
        id="downloads-overview"
        className="rounded-2xl"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 16,
          scrollMarginTop: 120,
          padding: "18px 20px",
          border: `1px solid ${BORDER}`,
          borderLeft: `3px solid rgba(7, 176, 242, 0.55)`,
          background: "linear-gradient(165deg, rgba(7, 176, 242, 0.09) 0%, rgba(255, 255, 255, 0.97) 55%, #FFFFFF 100%)",
          boxShadow: "0 2px 16px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div>
          <h2 className="bs-h2 mb-2 mt-0">Your deliverables</h2>
          {suiteProgressHint ? (
            <p className="text-sm font-semibold text-brand-blue max-w-[720px] mb-2.5 m-0" style={{ lineHeight: 1.55 }}>
              {suiteProgressHint}
            </p>
          ) : null}
          <p className="bs-body-sm text-brand-muted max-w-[620px] m-0">
            {docsNeedingRegen > 0
              ? `${docsNeedingRegen} document${docsNeedingRegen > 1 ? "s are" : " is"} updated since last generation.`
              : "All documents are current. Workbook-linked documents regenerate after workbook updates."}
          </p>
          <p className="bs-small text-brand-muted max-w-[720px] mt-2 mb-0">
            Organize by document type and export what each stakeholder needs.
          </p>
          <p className="bs-small text-brand-muted max-w-[720px] mt-2 mb-0">
            Everything you see and refine in the tabs is included in your downloadable deliverables.
            Workbook-linked documents pull the latest version of tab content (strategy, standards, and activation)
            at generation time.
          </p>
        </div>
        {isBlueprintPlus && onDownloadAll && (
          <button onClick={onDownloadAll} style={{ padding: "11px 22px", backgroundColor: BLUE, color: "#ffffff", border: "none", borderRadius: SUITE_RADIUS_BUTTON, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: SUITE_FONT_UI, flexShrink: 0 }}>
            Download All as .zip
          </button>
        )}
      </div>
      {DOWNLOADS_GROUPS.map((group) => {
        const groupDocs = availableDocs.filter((doc) => doc.group === group);
        if (groupDocs.length === 0) return null;
        const groupId =
          group === "core"
            ? "downloads-core"
            : group === "strategy"
              ? "downloads-strategy"
              : group === "activation"
                ? "downloads-activation"
                : "downloads-role-packs";
        return (
          <div key={group} id={groupId} style={{ marginBottom: 40, scrollMarginTop: 120 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: MID_GRAY, margin: "0 0 16px", paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>
              {GROUP_LABELS[group]}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {groupDocs.map((doc) => (
                <DocumentTile
                  key={doc.id}
                  doc={doc}
                  state={stateMap[doc.id]}
                  onDownload={onDownload}
                  onGenerate={onGenerate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </TabPageWithSidebar>
  );
}
