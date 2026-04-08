"use client";

import { useEffect, useState } from "react";
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
import { PROMPT_SECTIONS_BY_PRODUCT_TIER } from "@/lib/promptPackData";

import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

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
  const promptPackSections = PROMPT_SECTIONS_BY_PRODUCT_TIER[productTier] ?? [];
  const hasPromptLibrary = promptPackSections.length > 0;
  const workbookMenuItems = [
    { id: "workbook-overview", label: "Overview", icon: "OV" },
    { id: "workbook-diagnostic-truth", label: "Diagnostic Truth", icon: "DT" },
    ...availableSections.map((section) => ({
      id: `workbook-section-${section.id}`,
      label: section.label,
    })),
    ...(hasPromptLibrary ? [{ id: "workbook-prompt-library", label: "Prompt library", icon: "PL" }] : []),
  ];
  if (workbookState.versions.length > 0) {
    workbookMenuItems.push({ id: "workbook-version-history", label: "Version History", icon: "VH" });
  }

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
    <TabPageWithSidebar navTitle="Workbook" navItems={workbookMenuItems}>
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
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: BLUE,
              marginBottom: 8,
            }}
          >
            Workbook
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
            {String(diagnosticData.companyName ?? "Your")} Brand Workbook
          </h2>
          {suiteProgressHint ? (
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0369A1",
                lineHeight: 1.55,
                maxWidth: 720,
                margin: "0 0 10px",
              }}
            >
              {suiteProgressHint}
            </p>
          ) : null}
          <p style={{ fontSize: 15, color: MID_GRAY, lineHeight: 1.5, maxWidth: 620, margin: 0 }}>
            {isSnapshotPlus
              ? "Your diagnostic truth and brand strategy foundation are read only in WunderBrand Snapshot+™."
              : isBlueprintPlus
                ? "Your locked diagnostic truth and editable strategy are always available."
                : editWindowExpired
                  ? "Your 14-day edit window has closed. Upgrade to WunderBrand Blueprint+™ for ongoing edits."
                  : `Your workbook is editable. ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining in your edit window.`}
          </p>
          <p style={{ fontSize: 12, color: MID_GRAY, lineHeight: 1.5, maxWidth: 720, margin: "8px 0 0" }}>
            Refine a section, then save a version so Downloads can pick up the latest wording.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isBlueprintPlus && (
            <button
              onClick={handleSaveVersion}
              disabled={savingVersion}
              style={{
                padding: "9px 16px",
                backgroundColor: "transparent",
                color: NAVY,
                border: `2px solid ${BORDER}`,
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {savingVersion ? "Saving..." : "Save Version"}
            </button>
          )}
          {isBlueprintPlus && workbookState.versions.length > 0 && (
            <button
              onClick={() => setShowVersionHistory(true)}
              style={{
                padding: "9px 16px",
                backgroundColor: "transparent",
                color: NAVY,
                border: `2px solid ${BORDER}`,
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Version History ({workbookState.versions.length})
            </button>
          )}
          <button
            onClick={onExportWorkbook}
            style={{
              padding: "9px 16px",
              backgroundColor: BLUE,
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Lato', sans-serif",
            }}
          >
            Export Workbook
          </button>
        </div>
      </div>
      <div
        id="workbook-deliverable"
        style={{
          marginBottom: 22,
          padding: "14px 16px",
          border: `1px solid ${BORDER}`,
          borderLeft: `4px solid ${BLUE}`,
          borderRadius: 8,
          background: "linear-gradient(135deg, #FFFFFF 0%, #F7FBFF 100%)",
          display: "grid",
          gap: 8,
          scrollMarginTop: 120,
          boxShadow: "0 8px 20px rgba(2,24,89,0.05)",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: NAVY, fontWeight: 700 }}>
          Refined final plan
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#2D3A4A", lineHeight: 1.55 }}>
          Use Workbook to refine copy and plans before exporting. Your diagnostic truth remains locked
          while planning sections stay editable based on your tier. AI prompts live in Prompt library
          below — separate from Activation channel plans.
        </p>
        <p style={{ margin: 0, fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
          Recommended sequence: review Activation plans, refine workbook sections, use Prompt library when
          you want AI drafting help, save versions (Blueprint+), then export from Downloads.
        </p>
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
          <div
            style={{
              marginBottom: 16,
              padding: "14px 16px",
              border: `1px solid ${BORDER}`,
              borderLeft: `4px solid ${BLUE}`,
              borderRadius: 8,
              background: "linear-gradient(135deg, #FFFFFF 0%, #F7FBFF 100%)",
              boxShadow: "0 8px 20px rgba(2,24,89,0.05)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: NAVY, fontWeight: 700 }}>Prompt library</p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#2D3A4A", lineHeight: 1.55 }}>
              Tier-matched AI prompts by topic — kept separate from Activation so this tab stays for drafting
              and saving outputs next to your workbook sections.
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
