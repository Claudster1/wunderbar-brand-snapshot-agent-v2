import type { ReactNode } from "react";
import { ResultsSnapshotLeadGate } from "@/app/results/components/ResultsSnapshotLeadGate";
import { BrandArchetypeIcon } from "@/components/results/BrandIcons";
import { getArchetypeMeaning } from "@/lib/archetype/likelyArchetype";
import { MainGauge } from "./MainGauge";
import { PillarIcon } from "./PillarIcon";
import { PillarMeter } from "./PillarMeter";
import { Section, SectionTitle } from "./ReportSection";
import {
  ACCENT_BG,
  BLUE,
  BORDER,
  GREEN,
  LIGHT_BG,
  NAVY,
  ORANGE,
  RADIUS_MD,
  RED_S,
  SUB,
  WHITE,
  YELLOW,
  GOOD_GREEN,
  scoreColor,
  scoreLabel,
  weakestPillarCallout,
} from "./tokens";

const PILLARS = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
type PillarKey = (typeof PILLARS)[number];
type PillarInsight =
  | string
  | {
      strength?: string;
      opportunity?: string;
      action?: string;
      whatsWorking?: string;
      whatsUnclear?: string;
      whyItMatters?: string;
    };

export type SnapshotDocumentResultsProps = {
  businessName: string;
  reportDate?: string;
  brandAlignmentScore: number;
  pillarScores: Record<PillarKey, number>;
  pillarInsights: Partial<Record<PillarKey, PillarInsight>>;
  pillarOverviews?: Partial<Record<PillarKey, string>>;
  recommendations: string[];
  likelyArchetype?: string | null;
  archetypeMeaning?: string | null;
  diagnosis?: string;
  primaryOpportunity?: string;
  primaryRisk?: string;
  overview?: string;
  emailGate: null | {
    reportId: string;
    requiresEmailGate: boolean;
    initiallyUnlocked: boolean;
    productTier: "snapshot" | "snapshot-plus";
    productName: string;
    firstNameHint?: string;
    afterUnlock?: ReactNode;
  };
  suiteCta?: ReactNode;
};

const PILLAR_LABELS: Record<PillarKey, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

const FALLBACKS: Record<
  PillarKey,
  { working: string; unclear: string; matters: string; action: string }
> = {
  positioning: {
    working: "Your offer has the beginnings of a distinct place in the market.",
    unclear: "The clearest point of difference is not yet expressed consistently.",
    matters: "Clear positioning helps ideal customers understand why your brand is the right choice.",
    action: "Rewrite your core positioning promise in one audience-focused sentence.",
  },
  messaging: {
    working: "Your brand has useful ideas and benefits to communicate.",
    unclear: "The supporting message and proof are not yet consistent across touchpoints.",
    matters: "Consistent messaging turns your positioning into language customers can remember and trust.",
    action: "Choose three message pillars and align your homepage copy to them.",
  },
  visibility: {
    working: "Your brand has channels it can use to build awareness.",
    unclear: "Visibility efforts may not yet follow one focused, repeatable strategy.",
    matters: "Focused visibility compounds attention instead of spreading effort across disconnected activity.",
    action: "Select one priority channel and one message theme for the next 30 days.",
  },
  credibility: {
    working: "Your experience and customer outcomes provide a foundation for trust.",
    unclear: "Proof points may be missing or hard to find at key decision moments.",
    matters: "Visible proof reduces perceived risk and helps prospects act with confidence.",
    action: "Add a specific testimonial, result, or trust signal near your primary call to action.",
  },
  conversion: {
    working: "Your brand gives prospective customers a path toward taking action.",
    unclear: "The next step or follow-up journey may not be clear enough.",
    matters: "A focused conversion path turns brand attention into qualified demand.",
    action: "Audit your primary call to action and remove competing next steps.",
  },
};

function cleanText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeInsight(
  pillar: PillarKey,
  insight: PillarInsight | undefined,
  overview: string | undefined,
  score: number,
) {
  const fallback = FALLBACKS[pillar];
  if (typeof insight === "string") {
    return {
      whatsWorking: score >= 14 ? fallback.working : `There is a usable foundation in your ${PILLAR_LABELS[pillar].toLowerCase()} work.`,
      whatsUnclear: cleanText(insight) ?? cleanText(overview) ?? fallback.unclear,
      whyItMatters: fallback.matters,
    };
  }
  return {
    whatsWorking:
      cleanText(insight?.strength) ??
      cleanText(insight?.whatsWorking) ??
      (score >= 14 ? fallback.working : `A foundation exists, but this pillar still needs deliberate strengthening.`),
    whatsUnclear:
      cleanText(insight?.opportunity) ??
      cleanText(insight?.whatsUnclear) ??
      cleanText(overview) ??
      fallback.unclear,
    whyItMatters:
      cleanText(insight?.action) ??
      cleanText(insight?.whyItMatters) ??
      fallback.matters,
  };
}

function actionPillar(action: string, fallback: PillarKey): PillarKey {
  const lower = action.toLowerCase();
  return PILLARS.find((pillar) => lower.includes(pillar)) ?? fallback;
}

export function SnapshotDocumentResults({
  businessName,
  reportDate,
  brandAlignmentScore,
  pillarScores,
  pillarInsights,
  pillarOverviews,
  recommendations,
  likelyArchetype,
  archetypeMeaning,
  diagnosis,
  primaryOpportunity,
  primaryRisk,
  overview,
  emailGate,
  suiteCta,
}: SnapshotDocumentResultsProps) {
  const entries = PILLARS.map((key) => ({
    key,
    label: PILLAR_LABELS[key],
    score: Math.max(0, Math.min(20, Math.round(Number(pillarScores[key]) || 0))),
  }));
  const strongest = [...entries].sort((a, b) => b.score - a.score)[0];
  const weakest = [...entries].sort((a, b) => a.score - b.score)[0];
  const score = Math.max(0, Math.min(100, Math.round(brandAlignmentScore)));
  const scoreBand = scoreLabel(score).toLowerCase();
  const resolvedDiagnosis =
    cleanText(diagnosis) ??
    `${businessName} has a ${scoreBand} brand foundation, with the clearest opportunity concentrated in ${weakest.label.toLowerCase()}.`;
  const resolvedOpportunity =
    cleanText(primaryOpportunity) ??
    `Strengthen ${weakest.label.toLowerCase()} first so improvements carry through the rest of the customer journey.`;
  const resolvedRisk =
    cleanText(primaryRisk) ??
    `If ${weakest.label.toLowerCase()} remains unresolved, stronger pillars may not translate into consistent trust or action.`;
  const resolvedOverview =
    cleanText(overview) ??
    `${businessName}'s strongest signal is ${strongest.label.toLowerCase()} at ${strongest.score}/20. ${weakest.label} is the highest-leverage area to improve next at ${weakest.score}/20.`;
  const resolvedArchetypeMeaning =
    cleanText(archetypeMeaning) ??
    getArchetypeMeaning(likelyArchetype) ??
    "Your archetype describes the personality pattern your brand can use to communicate more consistently.";
  const actions =
    recommendations.filter((item) => cleanText(item)).slice(0, 5).length > 0
      ? recommendations.filter((item) => cleanText(item)).slice(0, 5)
      : [
          FALLBACKS[weakest.key].action,
          FALLBACKS[entries[1]?.key ?? "messaging"].action,
          "Review these changes after 30 days and track which message creates the clearest response.",
        ];

  const gatedContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Section id="pillar-scores" pageBreak>
        <SectionTitle description="Each pillar is scored out of 20, reflecting the strength and clarity of that dimension of your brand.">
          Brand Pillar Scores
        </SectionTitle>
        <div data-snapshot-pillar-meters style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px", padding: "20px 24px", background: LIGHT_BG, borderRadius: RADIUS_MD, marginBottom: 24 }}>
          {entries.map((pillar) => (
            <div key={pillar.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PillarIcon pillar={pillar.key} size={20} />
              <div style={{ flex: 1 }}>
                <PillarMeter score={pillar.score} label={pillar.label} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${BORDER}` }}>
          Detailed Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {entries.map((pillar) => {
            const percent = (pillar.score / 20) * 100;
            const detail = normalizeInsight(
              pillar.key,
              pillarInsights[pillar.key],
              pillarOverviews?.[pillar.key],
              pillar.score,
            );
            return (
              <div key={pillar.key} style={{ padding: "24px 28px", borderRadius: RADIUS_MD, border: `1px solid ${BORDER}`, background: WHITE }}>
                <div data-snapshot-pillar-header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PillarIcon pillar={pillar.key} size={22} />
                    <span style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{pillar.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(percent), textTransform: "uppercase" }}>{scoreLabel(percent)}</span>
                    <span style={{ padding: "4px 12px", borderRadius: RADIUS_MD, background: scoreColor(percent), color: WHITE, fontSize: 16, fontWeight: 900 }}>{pillar.score}/20</span>
                  </div>
                </div>
                <div data-snapshot-pillar-detail style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <InsightCard label="What's Working" text={detail.whatsWorking} color={GREEN} />
                  <InsightCard label="What's Unclear" text={detail.whatsUnclear} color={ORANGE} />
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Why This Matters</div>
                  <div style={{ fontSize: 16, color: "#1A1A2E", lineHeight: 1.6 }}>{detail.whyItMatters}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="brand-archetype" pageBreak style={{ background: `linear-gradient(135deg, ${NAVY}05 0%, ${BLUE}08 100%)` }}>
        <SectionTitle hero description="Your archetype is the personality pattern your brand can use to build recognition and emotional consistency.">
          Brand Archetype
        </SectionTitle>
        <div data-snapshot-archetype-layout style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 180 }}>
            <div style={{ width: 130, height: 130, borderRadius: RADIUS_MD, background: WHITE, border: `2px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(2,24,89,0.08)" }}>
              <BrandArchetypeIcon archetype={likelyArchetype} size={88} color={BLUE} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: BLUE, marginTop: 10, textAlign: "center" }}>
              {likelyArchetype || "Archetype in progress"}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "14px 18px", borderRadius: RADIUS_MD, background: `${BLUE}08`, border: `1px solid ${BLUE}15`, fontSize: 15, color: "#1A1A2E", lineHeight: 1.65 }}>
              {resolvedArchetypeMeaning}
            </div>
            <SignalRail label="When Aligned" color={GREEN}>
              This archetype gives your brand a recognizable point of view and helps every touchpoint feel connected.
            </SignalRail>
            <SignalRail label="If Misused" color={ORANGE}>
              Overusing one personality trait can make the brand feel one-dimensional; balance it with clarity and audience relevance.
            </SignalRail>
          </div>
        </div>
      </Section>

      <Section id="next-steps">
        <SectionTitle description="Focus on these practical actions over the next 7–14 days, starting with the highest-leverage gap.">
          Your Next Steps
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {actions.map((action, index) => {
            const pillar = actionPillar(action, index === 0 ? weakest.key : entries[index % entries.length].key);
            return (
              <div key={`${index}-${action}`} data-snapshot-action-item style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "18px 22px", borderRadius: RADIUS_MD, border: `1px solid ${BORDER}`, background: index === 0 ? `${BLUE}06` : WHITE }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{index + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: BLUE, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                    {PILLAR_LABELS[pillar]}
                  </div>
                  <div style={{ fontSize: 16, color: "#1A1A2E", lineHeight: 1.6 }}>{action}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
      {suiteCta}
    </div>
  );

  return (
    <div data-snapshot-document style={{ background: LIGHT_BG, borderRadius: RADIUS_MD, padding: "24px", fontFamily: "'Lato', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          [data-snapshot-document] { padding: 12px !important; }
          [data-snapshot-document-section] { padding: 20px 16px !important; }
          [data-snapshot-key-cards], [data-snapshot-pillar-meters], [data-snapshot-pillar-detail] { grid-template-columns: 1fr !important; }
          [data-snapshot-gauge-row], [data-snapshot-archetype-layout], [data-snapshot-action-item] { flex-direction: column !important; }
          [data-snapshot-score-stack] { grid-template-columns: 1fr !important; }
          [data-snapshot-pillar-header] { align-items: flex-start !important; flex-direction: column !important; }
        }
      ` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em" }}>Brand Alignment Diagnostic</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: BLUE, marginTop: 3 }}>{businessName}</div>
        </div>
        {reportDate ? <div style={{ fontSize: 13, color: SUB }}>{reportDate}</div> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderRadius: RADIUS_MD, background: `${BLUE}06`, border: `1px solid ${BLUE}15` }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${BLUE}`, color: BLUE, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>i</span>
          <div style={{ fontSize: 14, color: SUB, lineHeight: 1.5 }}>
            <strong style={{ color: NAVY }}>How to read this report:</strong> Each pillar is rated out of 20. Scores are <strong style={{ color: RED_S }}>Critical</strong> (0–19%), <strong style={{ color: ORANGE }}>Weak</strong> (20–39%), <strong style={{ color: YELLOW }}>Fair</strong> (40–59%), <strong style={{ color: GOOD_GREEN }}>Good</strong> (60–79%), or <strong style={{ color: GREEN }}>Strong</strong> (80–100%). The WunderBrand Score™ is the composite total out of 100.
          </div>
        </div>

        <Section id="executive-summary">
          <SectionTitle hero description="A high-level view of your brand's alignment across five key pillars.">Executive Summary</SectionTitle>
          <div data-snapshot-key-cards style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
            <SummaryCard label="Overall Score" score={score} max={100} icon="overall" />
            <SummaryCard label="Strongest Pillar" score={strongest.score} max={20} pillar={strongest.label} icon="strongest" />
            <SummaryCard label={weakestPillarCallout((weakest.score / 20) * 100)} score={weakest.score} max={20} pillar={weakest.label} icon="opportunity" />
          </div>
          <div style={{ padding: "16px 20px", borderRadius: RADIUS_MD, marginBottom: 16, background: `${BLUE}08`, borderLeft: `3px solid ${BLUE}`, fontSize: 18, fontWeight: 700, color: NAVY, lineHeight: 1.6, fontStyle: "italic" }}>
            {resolvedDiagnosis}
          </div>
          <div style={{ fontSize: 16, color: "#1A1A2E", lineHeight: 1.75 }}>{resolvedOverview}</div>
        </Section>

        <Section id="brand-alignment-score">
          <SectionTitle hero description="A composite measure of how clearly and consistently your brand communicates across all five pillars.">
            WunderBrand Score™
          </SectionTitle>
          <div
            data-snapshot-score-stack
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, auto) minmax(0, 1fr)",
              gap: "28px 40px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <MainGauge score={score} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              <SignalRail label="Diagnosis" color={NAVY}>{resolvedDiagnosis}</SignalRail>
              <SignalRail label="Primary Opportunity" color={GREEN}>{resolvedOpportunity}</SignalRail>
              <SignalRail label="Risk if Unchanged" color={ORANGE}>{resolvedRisk}</SignalRail>
            </div>
          </div>
        </Section>

        {emailGate ? (
          <ResultsSnapshotLeadGate {...emailGate}>{gatedContent}</ResultsSnapshotLeadGate>
        ) : (
          gatedContent
        )}
      </div>
    </div>
  );
}

function SummaryCardIcon({ kind }: { kind: "overall" | "strongest" | "opportunity" }) {
  if (kind === "overall") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} aria-hidden>
        <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "strongest") {
    return (
      <svg viewBox="0 0 24 24" fill="none" width={22} height={22} aria-hidden>
        <path
          d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"
          stroke={BLUE}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" width={22} height={22} aria-hidden>
      <path d="M12 9v4M12 17h.01" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M10.3 3.2L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.2a2 2 0 00-3.4 0z"
        stroke={BLUE}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryCard({
  label,
  score,
  max,
  pillar,
  icon,
}: {
  label: string;
  score: number;
  max: number;
  pillar?: string;
  icon: "overall" | "strongest" | "opportunity";
}) {
  const percent = (score / max) * 100;
  const color = scoreColor(percent);
  return (
    <div style={{ padding: 20, borderRadius: RADIUS_MD, border: `1px solid ${BORDER}`, background: LIGHT_BG, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <SummaryCardIcon kind={icon} />
      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginTop: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 10 }}>
        <span style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color }}>/{max}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase" }}>{scoreLabel(percent)}</span>
      </div>
      {pillar ? <span style={{ display: "inline-block", marginTop: 8, padding: "4px 14px", borderRadius: RADIUS_MD, background: `${BLUE}12`, border: `1px solid ${BLUE}30`, fontSize: 14, fontWeight: 700, color: NAVY }}>{pillar}</span> : null}
    </div>
  );
}

function SignalRail({ label, color, children }: { label: string; color: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%" }}>
      <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: SUB, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 16, color: "#1A1A2E", lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

function InsightCard({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: RADIUS_MD, background: `${color}08` }}>
      <div style={{ fontSize: 12, fontWeight: 900, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, color: "#1A1A2E", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}
