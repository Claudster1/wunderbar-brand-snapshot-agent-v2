"use client";

import { ScoreGauge } from "@/src/components/ScoreGauge";
import { getOverallScoreRating } from "@/src/lib/results/scoreRating";
import { getGaugeAccentForScore } from "@/src/lib/results/scoreBands";
import { TooltipIcon } from "@/components/ui/Tooltip";
import { UserRoleContext } from "@/src/types/snapshot";
import type { PillarKey } from "@/src/types/pillars";
import { rolePhrase } from "@/src/lib/roleLanguage";
import { SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";
import { ResultsListIcon } from "@/components/results/BrandIcons";

const PILLAR_LABELS: Record<PillarKey, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

export interface ResultsHeroExecutiveContext {
  businessName: string;
  stage?: "early" | "scaling" | "growing";
  pillarScores: Partial<Record<PillarKey, number>>;
  primaryPillar: PillarKey;
  recommendationPreview?: string[];
}

interface ResultsHeroSectionProps {
  score: number;
  primaryPillar: string;
  hasSnapshotPlus: boolean;
  userRoleContext?: UserRoleContext;
  executiveContext?: ResultsHeroExecutiveContext;
}

/** Copy tiers use same breakpoints as `OVERALL_SCORE_GAUGE_RANGES` (80 / 60 / 40 / 20). */
function getScoreInterpretation(score: number): string {
  const s = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  if (s >= 80)
    return "Your brand demonstrates strong alignment across pillars — the focus now is refinement, consistency at scale, and protecting the competitive advantage you've built.";
  if (s >= 60)
    return "Your brand has a solid foundation with clear areas for strategic improvement — targeted investment in 1–2 pillars will create cascading impact across the system.";
  if (s >= 40)
    return "Your brand has identifiable strengths to build on, but material gaps in alignment are limiting growth — a focused, pillar-by-pillar approach will unlock the most value.";
  if (s >= 20)
    return "Your brand shows some signals of clarity, but uneven execution and weak proof across pillars are constraining growth — tightening one pillar at a time will lift the whole system.";
  return "Your brand has significant foundational work ahead — the good news is that clarity at this stage creates disproportionate returns on every dollar and hour invested.";
}

function stageClause(stage?: "early" | "scaling" | "growing"): string {
  if (stage === "scaling") return "as you scale";
  if (stage === "growing") return "during this growth phase";
  return "at your current stage";
}

function rankPillars(scores: Partial<Record<PillarKey, number>>): Array<{ key: PillarKey; score: number }> {
  const keys: PillarKey[] = ["positioning", "messaging", "visibility", "credibility", "conversion"];
  return keys
    .map((key) => ({ key, score: typeof scores[key] === "number" ? (scores[key] as number) : 0 }))
    .sort((a, b) => b.score - a.score);
}

function normalizePrimaryPillar(raw: string): PillarKey {
  const k = raw.toLowerCase().replace(/\s+/g, "") as PillarKey;
  if (k in PILLAR_LABELS) return k;
  const map: Record<string, PillarKey> = {
    positioning: "positioning",
    messaging: "messaging",
    visibility: "visibility",
    credibility: "credibility",
    conversion: "conversion",
  };
  return map[k] ?? "positioning";
}

export function ResultsHeroSection({
  score,
  primaryPillar,
  hasSnapshotPlus,
  userRoleContext,
  executiveContext,
}: ResultsHeroSectionProps) {
  const rating = getOverallScoreRating(score);
  const interpretation = getScoreInterpretation(score);
  const accent = getGaugeAccentForScore(score);
  /** Gauge stroke for most bands; darker headline on 40–59 (yellow) for readable text on light UI. */
  const verdictTextColor = (() => {
    const s = Math.round(score);
    if (s >= 40 && s <= 59) return accent.headline;
    return accent.stroke;
  })();
  const primaryKey = normalizePrimaryPillar(primaryPillar);

  const ranked = executiveContext ? rankPillars(executiveContext.pillarScores) : [];
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const primaryScore =
    executiveContext && typeof executiveContext.pillarScores[primaryKey] === "number"
      ? (executiveContext.pillarScores[primaryKey] as number)
      : undefined;
  const recs = executiveContext?.recommendationPreview?.filter((s) => s.trim()) ?? [];

  return (
    <section className="space-y-8 lg:space-y-10">
      <div className="bs-card rounded-xl p-6 sm:p-8 flex flex-col items-center text-center overflow-visible">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <h2 className="bs-h2 mb-0">WunderBrand Score™</h2>
          <TooltipIcon
            content={
              <>
                Weighted index across all five pillars (each scored 0–20). The 0–100 headline emphasizes
                positioning, messaging, and credibility more than visibility and conversion.
              </>
            }
          />
        </div>
        <div className="flex justify-center my-2 min-h-0 w-full overflow-visible py-2">
          <ScoreGauge value={score} showLegend />
        </div>
      </div>
      <div
        className="rounded-2xl border-2 border-brand-border/50 bg-white px-6 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10 shadow-[0_8px_30px_rgba(2,24,89,0.06)]"
        aria-labelledby="wunderbrand-verdict-heading"
      >
        <div className="mb-4 sm:mb-5">
          <p className={`${SUITE_SECTION_KICKER_CLASS} m-0`}>What This Score Means</p>
        </div>

        {/* Score readout: compact band-colored rail; score + rating share one row from sm+ */}
        <div
          className="relative mb-5 sm:mb-6 max-w-4xl overflow-hidden rounded-xl border border-brand-border/45 border-l-[5px] px-4 py-3.5 sm:px-5 sm:py-4 shadow-[0_4px_20px_rgba(2,24,89,0.06)] ring-1 ring-black/[0.04]"
          style={{
            borderLeftColor: accent.stroke,
            background: `linear-gradient(125deg, ${accent.softBg} 0%, #ffffff 48%, #fafbfd 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              background: `radial-gradient(120% 80% at 0% 0%, ${accent.stroke}22 0%, transparent 55%)`,
            }}
            aria-hidden
          />
          <div className="relative flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6 sm:gap-y-1">
            <div className="min-w-0">
              <p className="m-0 text-[13px] sm:text-sm font-semibold tracking-[0.08em] text-brand-muted">
                WunderBrand Score™
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold tabular-nums leading-none tracking-tight m-0 mt-1"
                style={{ color: verdictTextColor }}
              >
                {Math.round(score)}
                <span className="text-base sm:text-lg font-semibold text-brand-muted">/100</span>
              </p>
            </div>
            <h2
              id="wunderbrand-verdict-heading"
              className="text-lg sm:text-xl font-semibold leading-snug tracking-tight m-0 sm:max-w-[min(100%,22rem)] sm:text-right"
              style={{ color: verdictTextColor }}
            >
              {rating}
            </h2>
          </div>
        </div>

        <div className="max-w-3xl border-b border-brand-border/50 pb-8 sm:pb-10 mb-2 sm:mb-4">
          {executiveContext && (
            <>
              <p className="text-base sm:text-[1.05rem] text-brand-midnight leading-[1.65] sm:leading-[1.7] m-0 mb-12 sm:mb-16">
                <span className="font-semibold text-brand-navy">{executiveContext.businessName}</span>{" "}
                registers a composite score of{" "}
                <span className="font-semibold tabular-nums" style={{ color: verdictTextColor }}>
                  {Math.round(score)}/100
                </span>{" "}
                {stageClause(executiveContext.stage)}. This index reflects how consistently your brand shows up
                across the five pillars — before you invest in campaigns or creative, it tells you where the
                system is already working and where misalignment is quietly taxing growth.
              </p>
              <ul className="m-0 p-0 list-none flex flex-col gap-4 sm:gap-5">
                {strongest && strongest.score > 0 && (
                  <li className="flex gap-4 sm:gap-5 items-start rounded-xl border border-brand-border/55 bg-[#f8fafc] px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
                    <ResultsListIcon token={strongest.key} />
                    <div className="min-w-0 pt-0.5 text-base text-brand-midnight leading-[1.65] sm:leading-[1.7]">
                      <span className="font-semibold text-brand-navy block mb-1.5 sm:mb-2">Relative strength</span>
                      <span className="block">
                        {PILLAR_LABELS[strongest.key]} ({strongest.score}/20) is currently your strongest pillar
                        {weakest && weakest.key !== strongest.key
                          ? ` — contrast that with ${PILLAR_LABELS[weakest.key]} (${weakest.score}/20), where small upgrades tend to lift the whole score.`
                          : "."}
                      </span>
                    </div>
                  </li>
                )}
                <li className="flex gap-4 sm:gap-5 items-start rounded-xl border border-brand-border/55 bg-[#f8fafc] px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
                  <ResultsListIcon token="priorities" />
                  <div className="min-w-0 pt-0.5 text-base text-brand-midnight leading-[1.65] sm:leading-[1.7]">
                    <span className="font-semibold text-brand-navy block mb-1.5 sm:mb-2">Strategic focus</span>
                    <span className="block">
                      Your diagnostic flags{" "}
                      <span className="font-semibold text-brand-navy">{PILLAR_LABELS[primaryKey]}</span>
                      {typeof primaryScore === "number"
                        ? ` (${primaryScore}/20) as the highest-leverage place to intervene`
                        : " as the highest-leverage place to intervene"}
                      — improvements there usually compound across messaging, credibility, and conversion.
                    </span>
                  </div>
                </li>
                {recs[0] && (
                  <li className="flex gap-4 sm:gap-5 items-start rounded-xl border border-brand-border/55 bg-[#f8fafc] px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
                    <ResultsListIcon token="checklist" />
                    <div className="min-w-0 pt-0.5 text-base text-brand-midnight leading-[1.65] sm:leading-[1.7]">
                      <span className="font-semibold text-brand-navy block mb-1.5 sm:mb-2">Lead priority</span>
                      <span className="block">{recs[0]}</span>
                    </div>
                  </li>
                )}
              </ul>
            </>
          )}

          <p
            className={`text-base sm:text-lg text-brand-midnight leading-[1.65] sm:leading-[1.7] m-0 font-medium ${executiveContext ? "mt-12 sm:mt-16" : "mt-2 sm:mt-4"} mb-8 sm:mb-10`}
          >
            {interpretation}
            {userRoleContext ? (
              <>
                {" "}
                <span className="text-sm sm:text-[0.9375rem] text-brand-muted font-normal leading-[1.65] sm:leading-[1.7]">
                  Calibrated for your role in {rolePhrase(userRoleContext)}.
                </span>
              </>
            ) : null}
          </p>

          {executiveContext ? (
            <p className="text-sm sm:text-[0.9375rem] text-brand-muted leading-[1.65] m-0">
              Next, the <span className="font-semibold text-brand-navy">Brand Pillar Analysis</span> breaks down
              each dimension with strengths, gaps, and concrete next steps — then{" "}
              <span className="font-semibold text-brand-navy">Priority actions</span> translates the signal into
              a short list you can execute.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
