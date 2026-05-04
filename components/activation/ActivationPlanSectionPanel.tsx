"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ExecutionSchedule, { type ScheduleRow } from "@/components/ExecutionSchedule";
import type { ProductTier } from "@/components/results/tabConfig";
import { SectionGlyph } from "@/components/results/BrandIcons";
import PersonalizedGuidanceCard from "@/components/results/PersonalizedGuidanceCard";
import {
  AudienceFoundationVisual,
  CampaignJourneyContextVisual,
  CompetitiveMotionVisual,
  JourneyMapVisual,
} from "@/components/results/StoryVisuals";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BG_CARD,
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_INSIGHT_CARD_BASE,
  SUITE_INSIGHT_CARD_RAIL_LEFT,
  SUITE_MUTED,
  SUITE_NAVY,
  SUITE_PANEL_RAIL,
  SUITE_RADIUS_BUTTON,
  SUITE_RADIUS_LG,
  SUITE_RADIUS_MD,
  SUITE_RADIUS_SM,
  SUITE_SHADOW_CARD,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import type { ActivationPlanSection } from "@/lib/activation/activationPlanModel";
import { ACTIVATION_SECTION_ICON_TOKEN } from "@/lib/activation/activationPlanModel";
import {
  buildActivationGuidanceMaps,
  buildExpandedActivationContent,
  DO_DONT_ACTIVATION,
} from "@/lib/activation/activationPlanAugmentations";
import { SEMANTIC_DO, SEMANTIC_DONT } from "@/src/pdf/reportVisualTokens";
import AudienceSegmentsActivationPanel from "@/components/activation/AudienceSegmentsActivationPanel";
import PaidMediaActivationCreatives from "@/components/activation/PaidMediaActivationCreatives";
import ActivationPlanReadableBody from "@/components/activation/ActivationPlanReadableBody";
import { audienceSegmentsContextHasRenderablePanels } from "@/lib/activation/audienceSegmentsPlanView";
import { paidStrategyHasRenderableChannels } from "@/lib/activation/paidMediaPlanFields";
import { isActivationAudienceJourneySectionId } from "@/lib/activation/activationPlanAudienceVsCampaign";
import { activationCampaignSectionChart } from "@/components/activation/ActivationCampaignSectionVisuals";
import AudienceFoundationInfoTrigger from "@/components/activation/AudienceFoundationInfoTrigger";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

export type ActivationPlanEditAction =
  | { mode: "button"; onEdit: () => void }
  | { mode: "link"; href: string };

export type ActivationPlanSectionPanelProps = {
  section: ActivationPlanSection;
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  scheduleRows: ScheduleRow[];
  editAction: ActivationPlanEditAction;
  /** When set, schedule table + export appear for the execution roadmap plan. */
  onExportSchedule?: () => void;
  extraHeaderActions?: ReactNode;
  sectionDomId?: string;
  /** Optional: show instructional guidance blocks (defaults to false for cleaner execution view). */
  showGuidance?: boolean;
  /** On campaign plans, links to foundation playbooks (segments, journey, competitive motion). */
  audienceJourneyPlanLinks?: Array<{ label: string; href: string }>;
};

const BTN_STYLE: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: SUITE_RADIUS_BUTTON,
  border: `1px solid ${BORDER}`,
  background: SUITE_BG_CARD,
  color: NAVY,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SUITE_FONT_UI,
  textDecoration: "none",
  display: "inline-block",
  boxSizing: "border-box",
};

export default function ActivationPlanSectionPanel({
  section,
  productTier: _productTier,
  diagnosticData,
  scheduleRows,
  editAction,
  onExportSchedule,
  extraHeaderActions,
  sectionDomId,
  showGuidance = false,
  audienceJourneyPlanLinks,
}: ActivationPlanSectionPanelProps) {
  const showInstructionalSidebars = showGuidance;
  const paidStrategyRaw =
    section.id === "paid-ads" && diagnosticData.paidMediaStrategy && typeof diagnosticData.paidMediaStrategy === "object"
      ? (diagnosticData.paidMediaStrategy as Record<string, unknown>)
      : null;
  const showPaidStructured = Boolean(paidStrategyRaw && paidStrategyHasRenderableChannels(paidStrategyRaw));

  const icpForAudience =
    diagnosticData.icpConversionIntelligenceFramework &&
    typeof diagnosticData.icpConversionIntelligenceFramework === "object" &&
    !Array.isArray(diagnosticData.icpConversionIntelligenceFramework)
      ? (diagnosticData.icpConversionIntelligenceFramework as Record<string, unknown>)
      : null;
  const personaSegForAudience =
    diagnosticData.personaDrivenSegmentation &&
    typeof diagnosticData.personaDrivenSegmentation === "object" &&
    !Array.isArray(diagnosticData.personaDrivenSegmentation)
      ? (diagnosticData.personaDrivenSegmentation as Record<string, unknown>)
      : null;
  const audienceDefForAudience =
    diagnosticData.audiencePersonaDefinition &&
    typeof diagnosticData.audiencePersonaDefinition === "object" &&
    !Array.isArray(diagnosticData.audiencePersonaDefinition)
      ? (diagnosticData.audiencePersonaDefinition as Record<string, unknown>)
      : null;
  const showAudienceStructured =
    section.id === "audience-segments" &&
    audienceSegmentsContextHasRenderablePanels(icpForAudience, personaSegForAudience, audienceDefForAudience);

  const activationGuidance = buildActivationGuidanceMaps(diagnosticData);
  const expandedActivationContent = buildExpandedActivationContent();
  const iconToken = ACTIVATION_SECTION_ICON_TOKEN[section.id] || "channel";
  const isFoundationPlan = isActivationAudienceJourneySectionId(section.id);
  const isCampaignPlan = !isFoundationPlan;

  return (
    <section
      id={sectionDomId}
      style={{
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${SUITE_PANEL_RAIL}`,
        borderRadius: SUITE_RADIUS_LG,
        background: SUITE_BG_CARD,
        padding: "22px 24px 24px",
        scrollMarginTop: 120,
        boxShadow: SUITE_SHADOW_CARD,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SectionGlyph token={iconToken} size={18} color={BLUE} />
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: BLUE,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {section.label}
            </p>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: MID_GRAY, lineHeight: 1.55, maxWidth: 720 }}>
            {section.summary}
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {extraHeaderActions}
          {editAction.mode === "link" ? (
            <Link href={editAction.href} style={BTN_STYLE}>
              Edit in Workbook
            </Link>
          ) : (
            <button type="button" onClick={editAction.onEdit} style={BTN_STYLE}>
              Edit in Workbook
            </button>
          )}
        </div>
      </div>
      {audienceJourneyPlanLinks && audienceJourneyPlanLinks.length > 0 ? (
        <div
          style={{
            marginBottom: 14,
            ...SUITE_INSIGHT_CARD_BASE,
            ...SUITE_INSIGHT_CARD_RAIL_LEFT,
            borderRadius: SUITE_RADIUS_MD,
            padding: "12px 14px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.4, flex: "1 1 200px" }}>
            Built on Your Audience Foundation
          </p>
          <AudienceFoundationInfoTrigger links={audienceJourneyPlanLinks} variant="panel" />
        </div>
      ) : null}

      {section.id === "competitive-motion-plan" && !showAudienceStructured ? (
        <div style={{ marginBottom: 14 }}>
          <CompetitiveMotionVisual />
        </div>
      ) : null}

      {section.id === "audience-segments" && !showAudienceStructured ? (
        <div style={{ marginBottom: 14 }}>
          <AudienceFoundationVisual />
        </div>
      ) : null}

      {section.id === "journey-orchestration" && !showAudienceStructured ? (
        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 800,
              color: BLUE,
              letterSpacing: "0.04em",
            }}
          >
            At a Glance — Journey Shape
          </p>
          <JourneyMapVisual
            stages={[
              { label: "Aware", focus: "Thought leadership + discovery content." },
              { label: "Consider", focus: "Email follow-up with proof and objection handling." },
              { label: "Decide", focus: "High-intent offer + conversion page alignment." },
              { label: "Closed", focus: "Sales handoff with clear implementation timeline." },
            ]}
          />
        </div>
      ) : null}

      {isCampaignPlan ? (
        <div style={{ marginBottom: 14 }}>
          <CampaignJourneyContextVisual />
          {activationCampaignSectionChart(section.id, showPaidStructured)}
          {section.id === "paid-ads" && !showPaidStructured ? (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.5 }}>
              Funnel diagram is a <strong style={{ color: NAVY }}>reference</strong> only — your authoritative detail is in the sections below.
            </p>
          ) : null}
        </div>
      ) : null}

      {showPaidStructured && paidStrategyRaw ? (
        <PaidMediaActivationCreatives strategy={paidStrategyRaw} />
      ) : showAudienceStructured ? (
        <div style={{ display: "grid", gap: 14 }}>
          <AudienceFoundationVisual />
          <AudienceSegmentsActivationPanel
            icp={icpForAudience}
            personaSeg={personaSegForAudience ?? undefined}
            audienceDef={audienceDefForAudience ?? undefined}
          />
        </div>
      ) : null}

      {!showPaidStructured && !showAudienceStructured ? (
        <ActivationPlanReadableBody body={section.body} sectionId={section.id} />
      ) : null}
      {showInstructionalSidebars && expandedActivationContent[section.id] && (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: SUITE_RADIUS_SM,
              background: `${BLUE}14`,
              borderLeft: `3px solid ${BLUE}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: BLUE,
                letterSpacing: "0.03em",
              }}
            >
              Why This Matters
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: SUITE_TEXT_PRIMARY, lineHeight: 1.55 }}>
              {expandedActivationContent[section.id].why}
            </p>
          </div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: SUITE_RADIUS_SM,
              background: SUITE_BG_CARD,
              border: `1px solid ${BORDER}`,
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 14,
                fontWeight: 800,
                color: BLUE,
                letterSpacing: "0.03em",
              }}
            >
              Execution Checklist
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {expandedActivationContent[section.id].actions.map((item, index) => (
                <p
                  key={`${section.id}-check-${index}`}
                  style={{ margin: 0, fontSize: 13, color: SUITE_TEXT_PRIMARY, lineHeight: 1.55 }}
                >
                  {index + 1}. {item}
                </p>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: SUITE_RADIUS_SM,
                background: SEMANTIC_DO.bg,
                border: "1px solid rgba(5, 150, 105, 0.22)",
                borderLeft: `4px solid ${SEMANTIC_DO.border}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: SEMANTIC_DO.label,
                }}
              >
                Success check to watch
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.5 }}>
                {expandedActivationContent[section.id].kpi}
              </p>
            </div>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: SUITE_RADIUS_SM,
                background: SEMANTIC_DONT.bg,
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderLeft: `4px solid ${SEMANTIC_DONT.border}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: SEMANTIC_DONT.label,
                }}
              >
                Failure pattern (avoid)
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.5 }}>
                {expandedActivationContent[section.id].warning}
              </p>
            </div>
          </div>
        </div>
      )}
      {showInstructionalSidebars && activationGuidance[section.id] && (
        <PersonalizedGuidanceCard
          title={activationGuidance[section.id].title}
          doText={activationGuidance[section.id].doText}
          dontText={activationGuidance[section.id].dontText}
          example={activationGuidance[section.id].example}
        />
      )}
      {showInstructionalSidebars && DO_DONT_ACTIVATION[section.id] && (
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: SUITE_RADIUS_SM,
              background: SEMANTIC_DO.bg,
              border: "1px solid rgba(5, 150, 105, 0.22)",
              borderLeft: `4px solid ${SEMANTIC_DO.border}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: SEMANTIC_DO.label,
              }}
            >
              Do this
            </p>
            <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
              {DO_DONT_ACTIVATION[section.id].do.map((item, index) => (
                <p key={`${section.id}-do-${index}`} style={{ margin: 0, fontSize: 13, color: SEMANTIC_DO.text, lineHeight: 1.5 }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: SUITE_RADIUS_SM,
              background: SEMANTIC_DONT.bg,
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderLeft: `4px solid ${SEMANTIC_DONT.border}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: SEMANTIC_DONT.label,
              }}
            >
              Don&apos;t / not this
            </p>
            <div style={{ display: "grid", gap: 5, marginTop: 6 }}>
              {DO_DONT_ACTIVATION[section.id].dont.map((item, index) => (
                <p key={`${section.id}-dont-${index}`} style={{ margin: 0, fontSize: 13, color: SEMANTIC_DONT.text, lineHeight: 1.5 }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      {section.id === "execution-roadmap" && scheduleRows.length > 0 && onExportSchedule && (
        <div style={{ marginTop: 16 }}>
          <ExecutionSchedule rows={scheduleRows} onExportClick={onExportSchedule} />
        </div>
      )}
    </section>
  );
}
