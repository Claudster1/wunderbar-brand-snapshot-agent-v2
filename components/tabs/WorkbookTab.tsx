"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ProductTier } from "@/components/ResultsTabNav";
import {
  WORKBOOK_SECTIONS,
  type WorkbookSectionId,
  type WorkbookState,
  type WorkbookVersion,
} from "@/lib/workbookTypes";
import ExecutionSection from "@/components/ExecutionSection";
import DiagnosticTruthPanel from "@/components/workbook/DiagnosticTruthPanel";
import WorkbookSectionComponent from "@/components/workbook/WorkbookSection";
import MoodBoardWorkbookPanel from "@/components/workbook/MoodBoardWorkbookPanel";
import type { NormalizedImagerySample } from "@/lib/brand/brandImageryNormalize";
import VersionHistory from "@/components/workbook/VersionHistory";
import TabPageWithSidebar from "@/components/results/TabPageWithSidebar";
import { getSuiteProgressHint } from "@/lib/copy/resultsSuiteGuidance";
import type { Prompt } from "@/lib/promptPackData";
import { buildWorkbookNavMenuItems } from "@/lib/workbook/workbookNavMenu";
import { PROMPT_SECTIONS_BY_PRODUCT_TIER } from "@/lib/promptPackData";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_MD,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;
const BODY = SUITE_TEXT_PRIMARY;

const WORKBOOK_CALLOUT: CSSProperties = {
  marginBottom: 24,
  padding: "18px 22px",
  border: `1px solid ${BORDER}`,
  borderRadius: SUITE_RADIUS_MD,
  background: "#FFFFFF",
  display: "grid",
  gap: 10,
  scrollMarginTop: 120,
  boxShadow: SUITE_SHADOW_CARD,
  fontFamily: SUITE_FONT_UI,
};

const BTN_PRIMARY: CSSProperties = {
  padding: "10px 18px",
  backgroundColor: BLUE,
  color: "#ffffff",
  border: "none",
  borderRadius: SUITE_RADIUS_MD,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
};

const BTN_SECONDARY: CSSProperties = {
  padding: "10px 18px",
  backgroundColor: "#FFFFFF",
  color: NAVY,
  border: `1px solid ${BORDER}`,
  borderRadius: SUITE_RADIUS_MD,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
};

interface WorkbookTabProps {
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  workbookState: WorkbookState;
  resultsDeliveredAt: string;
  focusedSectionId?: WorkbookSectionId | null;
  onFocusedSectionHandled?: () => void;
  onSaveSection: (sectionId: string, content: string) => Promise<void>;
  moodBoardSamples: NormalizedImagerySample[];
  onSaveMoodBoard: (samples: NormalizedImagerySample[]) => Promise<void>;
  onSaveVersion: (label?: string) => Promise<void>;
  onRestoreVersion: (version: WorkbookVersion) => Promise<void>;
  onExportWorkbook: () => void;
  onAskWundy: (prompt: Prompt) => void;
  shellRendersSectionChips?: boolean;
  shellActiveSectionId?: string | null;
}

const TIER_RANK: Record<string, number> = {
  snapshot: 0,
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

const SECTION_TIER_RANK: Record<string, number> = {
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

export default function WorkbookTab({
  productTier,
  diagnosticData,
  workbookState,
  resultsDeliveredAt,
  focusedSectionId,
  onFocusedSectionHandled,
  onSaveSection,
  moodBoardSamples,
  onSaveMoodBoard,
  onSaveVersion,
  onRestoreVersion,
  onExportWorkbook,
  onAskWundy,
  shellRendersSectionChips = false,
  shellActiveSectionId = null,
}: WorkbookTabProps) {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const isSnapshotPlus = productTier === "snapshot-plus";
  const isBlueprint = productTier === "blueprint";
  const isBlueprintPlus = productTier === "blueprint-plus";

  const tierRank = TIER_RANK[productTier] ?? 0;
  const editWindowExpired =
    isBlueprint &&
    (() => {
      const delivered = new Date(resultsDeliveredAt);
      const cutoff = new Date(delivered.getTime() + 14 * 24 * 60 * 60 * 1000);
      return new Date() > cutoff;
    })();

  function canEdit() {
    if (isSnapshotPlus) return false;
    if (isBlueprintPlus) return true;
    if (isBlueprint) return !editWindowExpired;
    return false;
  }

  function isSectionAvailable(availableFrom: string): boolean {
    return tierRank >= (SECTION_TIER_RANK[availableFrom] ?? 99);
  }

  const editable = canEdit();
  const availableSections = WORKBOOK_SECTIONS.filter((section) =>
    isSectionAvailable(section.availableFrom),
  );
  const textWorkbookSections = availableSections.filter((s) => s.id !== "mood-board");
  const showMoodBoardSection = availableSections.some((s) => s.id === "mood-board");
  const workbookMenuItems = buildWorkbookNavMenuItems(productTier, workbookState.versions.length);
  const promptPackSections = PROMPT_SECTIONS_BY_PRODUCT_TIER[productTier] ?? [];
  const hasPromptLibrary = promptPackSections.length > 0;

  const pillarScores = (
    (diagnosticData.pillarScores as Record<string, number> | undefined) ?? {}
  );
  const pillarScoreRows = Object.entries(pillarScores).map(([name, score]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    score: Number(score),
    max: 100,
  }));

  const daysRemaining = Math.max(
    0,
    14 -
      Math.floor(
        (Date.now() - new Date(resultsDeliveredAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
  );

  const suiteProgressHint = getSuiteProgressHint(productTier, "workbook");

  async function handleSaveVersion() {
    setSavingVersion(true);
    try {
      await onSaveVersion();
    } finally {
      setSavingVersion(false);
    }
  }

  useEffect(() => {
    if (!focusedSectionId) return;
    const id = `workbook-section-${focusedSectionId}`;
    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      onFocusedSectionHandled?.();
    }, 60);
    return () => window.clearTimeout(timeoutId);
  }, [focusedSectionId, onFocusedSectionHandled]);

  return (
    <TabPageWithSidebar
      navTitle="Workbook"
      navItems={workbookMenuItems}
      shellRendersSectionChips={shellRendersSectionChips}
      shellActiveSectionId={shellActiveSectionId}
    >
      <div
        id="workbook-overview"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 16,
          scrollMarginTop: 120,
        }}
      >
        <div>
          <h2 className="bs-h2 mb-2 mt-0">{String(diagnosticData.companyName ?? "Your")} brand workbook</h2>
          {suiteProgressHint ? (
            <p className="text-sm font-semibold text-brand-blue max-w-[720px] mb-2.5 m-0" style={{ lineHeight: 1.55 }}>
              {suiteProgressHint}
            </p>
          ) : null}
          <p className="bs-body-sm text-brand-muted max-w-[620px] m-0">
            {isSnapshotPlus
              ? "Your diagnostic truth and brand strategy foundation are read only in WunderBrand Snapshot+™."
              : isBlueprintPlus
                ? "Your locked diagnostic truth and editable strategy are always available."
                : editWindowExpired
                  ? "Your 14-day edit window has closed. Upgrade to WunderBrand Blueprint+™ for ongoing edits."
                  : `Your workbook is editable. ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining in your edit window.`}
          </p>
          <p className="bs-small text-brand-muted max-w-[720px] mt-2 mb-0">
            Refine a section, then save a version so Downloads can pick up the latest wording.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {isBlueprintPlus && (
            <button
              type="button"
              onClick={handleSaveVersion}
              disabled={savingVersion}
              style={{ ...BTN_PRIMARY, opacity: savingVersion ? 0.65 : 1 }}
            >
              {savingVersion ? "Saving..." : "Save Version"}
            </button>
          )}
          {isBlueprintPlus && workbookState.versions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowVersionHistory(true)}
              style={BTN_SECONDARY}
            >
              Version history ({workbookState.versions.length})
            </button>
          )}
          <button type="button" onClick={onExportWorkbook} style={BTN_PRIMARY}>
            Export workbook
          </button>
        </div>
      </div>
      <div id="workbook-deliverable" style={WORKBOOK_CALLOUT}>
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: BLUE }}>
          How this tab fits
        </p>
        <p className="m-0 text-[15px] font-semibold leading-snug" style={{ color: NAVY }}>
          Refine copy here, then export
        </p>
        <p className="m-0 text-sm leading-relaxed" style={{ color: BODY, maxWidth: 720 }}>
          Diagnostic truth stays locked. Editable sections follow your product tier. The Prompt Library below is for
          drafting with AI outputs you can paste into sections — it is separate from Activation channel execution plans.
        </p>
        <ol
          className="m-0 grid list-decimal gap-2 pl-5 text-[13px] leading-relaxed sm:text-sm"
          style={{ color: MID_GRAY, maxWidth: 720 }}
        >
          <li>Review Activation for channel-specific plans.</li>
          <li>Update workbook sections with your final language.</li>
          <li>Use Prompt Library when you want structured AI drafts.</li>
          <li>
            {isBlueprintPlus
              ? "Save a named version, then export from Downloads."
              : "Export from Downloads when you are ready to share."}
          </li>
        </ol>
      </div>

      <div id="workbook-diagnostic-truth" style={{ scrollMarginTop: 120 }}>
        <DiagnosticTruthPanel
          businessName={String(diagnosticData.companyName ?? "")}
          wunderBrandScore={Number(diagnosticData.wunderBrandScore ?? 0)}
          primaryArchetype={String(diagnosticData.primaryArchetype ?? "")}
          secondaryArchetype={diagnosticData.secondaryArchetype as string | undefined}
          pillarScores={pillarScoreRows}
          primaryPillar={String(diagnosticData.primaryPillar ?? "")}
          competitiveVulnerabilitySeverity={
            ((diagnosticData.competitiveVulnerability as { severity?: string } | undefined)
              ?.severity as "low" | "medium" | "high" | undefined)
          }
          marketingSpendEfficiencySeverity={
            ((diagnosticData.marketingSpendEfficiency as { severity?: string } | undefined)
              ?.severity as "low" | "medium" | "high" | undefined)
          }
          resultsDeliveredAt={resultsDeliveredAt}
        />
      </div>

      {textWorkbookSections.map((section) => (
        <WorkbookSectionComponent
          key={section.id}
          section={section}
          content={workbookState.sectionContent[section.id] ?? ""}
          isFocused={focusedSectionId === section.id}
          isEditable={editable}
          editWindowExpired={isBlueprint && editWindowExpired}
          onSave={onSaveSection}
        />
      ))}

      {showMoodBoardSection ? (
        <div id="workbook-section-mood-board" style={{ scrollMarginTop: 120 }}>
          <MoodBoardWorkbookPanel
            samples={moodBoardSamples}
            onSave={onSaveMoodBoard}
            editable={editable}
            editWindowExpired={isBlueprint && editWindowExpired}
          />
        </div>
      ) : null}

      {hasPromptLibrary && (
        <div id="workbook-prompt-library" style={{ scrollMarginTop: 120 }}>
          <div style={{ ...WORKBOOK_CALLOUT, marginBottom: 20 }}>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: BLUE }}>
              Prompt Library
            </p>
            <p className="m-0 text-sm leading-relaxed sm:text-[15px]" style={{ color: BODY, maxWidth: 720 }}>
              Tier-matched prompts by topic. Run a prompt, copy the output, and paste it into the matching workbook
              section above. Activation tab remains the home for paid, owned, and earned channel plans.
            </p>
          </div>
          {promptPackSections.map((sectionId) => (
            <div key={sectionId} id={`workbook-prompt-${sectionId}`} style={{ scrollMarginTop: 120 }}>
              <ExecutionSection
                sectionId={sectionId}
                productTier={productTier}
                diagnosticData={diagnosticData}
                onAskWundy={onAskWundy}
                activePack="all"
              />
            </div>
          ))}
        </div>
      )}

      {showVersionHistory && (
        <div id="workbook-version-history" style={{ scrollMarginTop: 120 }}>
          <VersionHistory
            versions={workbookState.versions}
            onRestoreVersion={async (version) => {
              await onRestoreVersion(version);
              setShowVersionHistory(false);
            }}
            onClose={() => setShowVersionHistory(false)}
          />
        </div>
      )}
    </TabPageWithSidebar>
  );
}
