"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import Link from "next/link";
import ActivationPlanSectionPanel from "@/components/activation/ActivationPlanSectionPanel";
import { filterActivationPlanSections, type ProductTier } from "@/components/results/tabConfig";
import type { ActivationPlanSection } from "@/lib/activation/activationPlanModel";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import {
  isActivationAudienceJourneySectionId,
  splitActivationSectionsByAudienceVsCampaign,
} from "@/lib/activation/activationPlanAudienceVsCampaign";
import { buildActivationFullPlanHref, buildResultsActivationTabHref } from "@/lib/activation/activationPlanLinks";
import type { ScheduleRow } from "@/components/ExecutionSchedule";
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

const TOOL_BTN: CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: "#FFFFFF",
  color: NAVY,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Lato', sans-serif",
};

const TOOL_LINK: CSSProperties = {
  ...TOOL_BTN,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
};

type Props = {
  section: ActivationPlanSection;
  productTier: ProductTier;
  diagnosticData: Record<string, unknown>;
  scheduleRows: ScheduleRow[];
  reportId: string;
  scheduleExportHref: string | null;
  resultsActivationHref?: string;
  workbookHref?: string;
  /** When set, PDF download can pull saved Workbook text for this plan. */
  userEmail?: string;
  /** Optional saved snapshot id (from Workbook version history); adds `versionId` to the PDF URL. */
  workbookVersionId?: string;
};

export default function ActivationPlanStandaloneClient({
  section,
  productTier,
  diagnosticData,
  scheduleRows,
  reportId,
  scheduleExportHref,
  resultsActivationHref,
  workbookHref,
  userEmail: userEmailProp,
  workbookVersionId,
}: Props) {
  const companyName =
    typeof diagnosticData.companyName === "string" && diagnosticData.companyName
      ? diagnosticData.companyName
      : "Your Brand";
  const activationPersonaIcpBanner =
    typeof diagnosticData.activationPersonaIcpBanner === "string"
      ? diagnosticData.activationPersonaIcpBanner.trim()
      : "";

  const userEmail =
    (typeof userEmailProp === "string" && userEmailProp.trim()) ||
    (typeof diagnosticData.userEmail === "string" ? diagnosticData.userEmail.trim() : "");
  const isPreviewReport =
    reportId.startsWith("preview-") ||
    reportId === "preview-results-tabs" ||
    reportId === "preview-mock";

  const tierSections = useMemo(
    () =>
      filterActivationPlanSections(
        productTier,
        buildActivationPlanSectionsList(diagnosticData, scheduleRows.length),
      ),
    [productTier, diagnosticData, scheduleRows.length],
  );

  const { audienceJourney } = useMemo(
    () => splitActivationSectionsByAudienceVsCampaign(tierSections),
    [tierSections],
  );

  const audienceJourneyPlanLinks = useMemo(() => {
    if (isActivationAudienceJourneySectionId(section.id)) return undefined;
    const out: Array<{ label: string; href: string }> = [];
    for (const s of audienceJourney) {
      const href = buildActivationFullPlanHref(s.id, reportId, userEmail, isPreviewReport);
      if (href) out.push({ label: s.label, href });
    }
    return out.length > 0 ? out : undefined;
  }, [section.id, audienceJourney, reportId, userEmail, isPreviewReport]);

  const campaignPlaybooksSuiteHref = useMemo(() => {
    if (!isActivationAudienceJourneySectionId(section.id)) return null;
    return buildResultsActivationTabHref(reportId, userEmail, {
      activationFocus: "campaigns",
      mode: isPreviewReport ? "preview-tabs" : undefined,
      activationPlanId: section.id,
    });
  }, [section.id, reportId, userEmail, isPreviewReport]);

  const activationHref =
    resultsActivationHref ??
    buildResultsActivationTabHref(reportId, userEmail, {
      activationFocus: isActivationAudienceJourneySectionId(section.id) ? "audience-journey" : "campaigns",
      mode: isPreviewReport ? "preview-tabs" : undefined,
      activationPlanId: section.id,
    });
  const editWorkbookHref =
    workbookHref ??
    `/results?reportId=${encodeURIComponent(reportId)}&tab=workbook&workbookSection=${encodeURIComponent(
      section.workbookSectionId,
    )}&activationPlanId=${encodeURIComponent(section.id)}`;
  const versionParam =
    typeof workbookVersionId === "string" && workbookVersionId.trim()
      ? `&versionId=${encodeURIComponent(workbookVersionId.trim())}`
      : "";
  const downloadPlanHref = isPreviewReport
    ? null
    : `/api/results/activation-plan-section/pdf?reportId=${encodeURIComponent(reportId)}&planId=${encodeURIComponent(section.id)}${
        userEmail ? `&email=${encodeURIComponent(userEmail)}` : ""
      }${versionParam}`;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 18px 48px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Link href={activationHref} style={TOOL_LINK}>
          ← Back to Activation
        </Link>
        {downloadPlanHref ? (
          <a href={downloadPlanHref} target="_blank" rel="noopener noreferrer" style={TOOL_LINK}>
            Download plan (PDF)
          </a>
        ) : null}
        <button type="button" onClick={() => window.print()} style={TOOL_BTN}>
          Print / Save as PDF
        </button>
        {scheduleExportHref ? (
          <a href={scheduleExportHref} style={TOOL_LINK}>
            Download activation schedule (.xlsx)
          </a>
        ) : null}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: BLUE,
            marginBottom: 6,
          }}
        >
          Activation plan
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "0 0 8px", lineHeight: 1.2 }}>
          {section.label}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: MID_GRAY, lineHeight: 1.55 }}>
          {companyName} — full playbook for this channel. The plan below is split into <strong style={{ color: NAVY }}>jumpable sections</strong> with clearer bullets and spacing so it is easier to scan than a single wall of text. Edit details in your
          Workbook; print or export when you need an offline copy.
        </p>
        {campaignPlaybooksSuiteHref ? (
          <p style={{ margin: "12px 0 0", fontSize: 13, color: MID_GRAY, lineHeight: 1.55 }}>
            Channel execution (email, paid, SEO, PR, rollout) lives under{" "}
            <Link href={campaignPlaybooksSuiteHref} style={{ fontWeight: 800, color: BLUE }}>
              Campaign playbooks
            </Link>{" "}
            on Activation — it all builds on this foundation.
          </p>
        ) : null}
        {activationPersonaIcpBanner && isActivationAudienceJourneySectionId(section.id) ? (
          <p
            style={{
              fontSize: 13,
              color: NAVY,
              lineHeight: 1.55,
              margin: "12px 0 0",
              padding: "10px 12px",
              borderRadius: 8,
              background: "#F0F9FF",
              border: `1px solid ${BORDER}`,
            }}
          >
            {activationPersonaIcpBanner}
          </p>
        ) : null}
      </div>

      <ActivationPlanSectionPanel
        section={section}
        productTier={productTier}
        diagnosticData={diagnosticData}
        scheduleRows={scheduleRows}
        audienceJourneyPlanLinks={audienceJourneyPlanLinks}
        editAction={{ mode: "link", href: editWorkbookHref }}
        onExportSchedule={
          section.id === "execution-roadmap" && scheduleExportHref
            ? () => {
                window.location.href = scheduleExportHref;
              }
            : undefined
        }
      />
    </div>
  );
}
