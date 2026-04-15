"use client";

import { SUITE_SECTION_KICKER_CLASS } from "@/components/results/suiteBrandTokens";
import { TooltipIcon } from "@/components/ui/Tooltip";

interface ContextCoverageMeterProps {
  coveragePercent: number;
  areas?: Array<{ name: string; percent: number; status?: string }>;
  contextGaps?: string[];
}

/** Same track gradient for Diagnostic Confidence + each “Coverage by area” bar. */
const COVERAGE_CONFIDENCE_TRACK_GRADIENT =
  "linear-gradient(to right, #ff3b30 0%, #ff9500 25%, #ffcc00 50%, #34c759 100%)";

function getCoverageVisual(percent: number): { color: string; softBg: string } {
  if (percent >= 80) return { color: "#16A34A", softBg: "#DCFCE7" };
  if (percent >= 60) return { color: "#34C759", softBg: "#ECFDF3" };
  if (percent >= 40) return { color: "#EAB308", softBg: "#FEF9C3" };
  if (percent >= 20) return { color: "#F97316", softBg: "#FFEDD5" };
  return { color: "#EF4444", softBg: "#FEE2E2" };
}

function getCoverageContext(percent: number): { label: string; detail: string } {
  if (percent >= 80)
    return {
      label: "Strong context",
      detail: "These insights are grounded in a comprehensive picture of your brand — the recommendations you see here are highly specific to your situation."
    };
  if (percent >= 60)
    return {
      label: "Good context",
      detail: "Your diagnostic is based on solid inputs. Adding deeper brand context in Snapshot+ will sharpen the specificity of recommendations and unlock additional strategic layers."
    };
  return {
    label: "Directional context",
    detail: "Your scores and insights are directional — they identify the right patterns, but richer inputs would make every recommendation significantly more precise and actionable."
  };
}

export function ContextCoverageMeter({
  coveragePercent,
  areas = [],
  contextGaps = [],
}: ContextCoverageMeterProps) {
  const context = getCoverageContext(coveragePercent);
  const visual = getCoverageVisual(coveragePercent);
  const clampedPercent = Math.max(0, Math.min(100, coveragePercent));

  return (
    <section className="bs-card rounded-xl p-0 overflow-hidden border border-brand-border/80 shadow-sm">
      <div className="border-b border-brand-border/60 bg-gradient-to-b from-white to-[#f8fafc] px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2.5">
              <p className={`${SUITE_SECTION_KICKER_CLASS} m-0`}>Context Signal</p>
              <TooltipIcon
                side="bottom"
                content={
                  <>
                    Reflects how much brand context was available for your diagnostic. Higher coverage means more
                    precise, tailored insights and recommendations.
                  </>
                }
              />
            </div>
            <span className="bs-h4 text-brand-navy mb-0 leading-tight">Diagnostic Confidence</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="bs-small font-semibold text-brand-navy">
              {context.label}
            </span>
            <span
              className="text-lg font-bold tabular-nums inline-flex items-center justify-center rounded-xl min-w-[4.25rem] h-11 px-3 shadow-sm"
              style={{
                color: visual.color,
                border: `2px solid ${visual.color}`,
                backgroundColor: visual.softBg,
              }}
            >
              {coveragePercent}%
            </span>
          </div>
        </div>

        <div>
          <div className="relative h-4 w-full sm:h-[18px]">
            <div
              className="absolute inset-y-0 left-2 right-2 overflow-hidden rounded-full shadow-inner ring-1 ring-black/[0.06] sm:left-2.5 sm:right-2.5"
              style={{
                background: COVERAGE_CONFIDENCE_TRACK_GRADIENT,
              }}
            />
            <div
              className="pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-brand-navy shadow-md ring-2 ring-brand-navy/20 transition-[left] duration-500 ease-out"
              style={{
                left: `calc(8px + (100% - 16px) * ${clampedPercent / 100})`,
              }}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex justify-between bs-small font-medium tabular-nums text-brand-muted">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="bg-white px-5 py-6 sm:px-7 sm:py-7">
        <p className="m-0 max-w-3xl text-base leading-relaxed text-brand-midnight">
          {context.detail}
        </p>
      </div>

      {areas.length > 0 && (
        <div className="border-t border-brand-border/50 bg-[#f9fafb] px-5 pb-7 pt-8 sm:px-7 sm:pb-8 sm:pt-9">
          <p className="bs-h4 mb-4 mt-0 m-0 leading-tight text-brand-navy">Coverage by Area</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
          {areas.map((area) => {
            const areaPercent = Math.max(0, Math.min(100, Number(area.percent) || 0));
            const areaVisual = getCoverageVisual(areaPercent);
            return (
              <div
                key={`${area.name}-${areaPercent}`}
                className="rounded-xl border border-brand-border/80 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="bs-small font-bold text-brand-navy">{area.name}</span>
                  <span
                    className="bs-small font-bold px-2.5 py-1 rounded-full tabular-nums"
                    style={{ backgroundColor: areaVisual.softBg, color: areaVisual.color }}
                  >
                    {areaPercent}%
                  </span>
                </div>
                <div className="relative mt-1 h-2.5 w-full px-0.5 sm:h-3 sm:px-1">
                  <div
                    className="absolute inset-y-0 left-0.5 right-0.5 overflow-hidden rounded-full shadow-inner ring-1 ring-black/[0.06] sm:left-1 sm:right-1"
                    style={{ background: COVERAGE_CONFIDENCE_TRACK_GRADIENT }}
                  />
                  <div
                    className="pointer-events-none absolute top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-navy shadow-md ring-1 ring-brand-navy/20 transition-[left] duration-500 ease-out sm:h-3.5 sm:w-3.5"
                    style={{
                      left: `calc(6px + (100% - 12px) * ${areaPercent / 100})`,
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {contextGaps.length > 0 && (
        <div
          className={
            areas.length > 0
              ? "border-t border-brand-border/50 bg-[#f9fafb] px-5 pb-8 pt-6 sm:px-7 sm:pb-9 sm:pt-7"
              : "border-t border-brand-border/50 bg-white px-5 pb-8 pt-6 sm:px-7 sm:pb-9 sm:pt-7"
          }
        >
          <div className="rounded-xl border-2 border-[#FDE68A] bg-[#FFFBEB] p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-[15px] font-semibold tracking-tight text-[#854D0E]">
              Areas for Deeper Analysis
            </p>
            <ul className="m-0 list-none space-y-4 p-0">
              {contextGaps.slice(0, 5).map((gap, idx) => (
                <li
                  key={`${idx}-${gap.slice(0, 24)}`}
                  className="flex gap-3 text-sm leading-relaxed text-brand-midnight pl-0"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#CA8A04]" aria-hidden />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
