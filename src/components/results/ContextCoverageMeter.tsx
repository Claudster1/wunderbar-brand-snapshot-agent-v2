"use client";

import { TooltipIcon } from "@/components/ui/Tooltip";

interface ContextCoverageMeterProps {
  coveragePercent: number;
  areas?: Array<{ name: string; percent: number; status?: string }>;
  contextGaps?: string[];
}

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
    <section className="bs-card rounded-xl p-6 sm:p-7">
      <div className="flex justify-between items-center mb-1 gap-3">
        <div className="flex items-center gap-2">
          <span className="bs-h4 text-brand-navy">
            Diagnostic Confidence
          </span>
          <TooltipIcon
            content={
              <>
                Reflects how much brand context was available for your diagnostic. Higher coverage means more precise, tailored insights and recommendations.
              </>
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="bs-small font-semibold text-brand-navy">
            {context.label}
          </span>
          <span
            className="bs-body-sm font-bold tabular-nums inline-flex items-center justify-center rounded-full"
            style={{
              minWidth: 54,
              height: 30,
              padding: "0 10px",
              color: visual.color,
              border: `2px solid ${visual.color}`,
              backgroundColor: visual.softBg,
            }}
          >
            {coveragePercent}%
          </span>
        </div>
      </div>

      <div className="mt-4 relative">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{
            background: "linear-gradient(to right, #ff3b30 0%, #ff9500 25%, #ffcc00 50%, #34c759 100%)",
          }}
        />
        <div
          className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-brand-navy transition-all duration-500 ease-out pointer-events-none"
          style={{ left: `${clampedPercent}%`, transform: "translate(-50%, -50%)" }}
          aria-hidden
        />
        <div className="flex justify-between mt-1.5 bs-small text-brand-muted tabular-nums">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <p className="bs-small text-brand-muted mt-3 leading-relaxed">
        {context.detail}
      </p>

      {areas.length > 0 && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {areas.map((area) => {
            const areaPercent = Math.max(0, Math.min(100, Number(area.percent) || 0));
            const status = (area.status || "").toLowerCase();
            const tone =
              status === "strong"
                ? { bar: "#16A34A", chipBg: "#DCFCE7", chipText: "#166534" }
                : status === "moderate"
                  ? { bar: "#EAB308", chipBg: "#FEF9C3", chipText: "#854D0E" }
                  : { bar: "#EF4444", chipBg: "#FEE2E2", chipText: "#991B1B" };
            return (
              <div key={`${area.name}-${areaPercent}`} className="rounded-lg border border-brand-border p-3 bg-white">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bs-small font-bold text-brand-navy">{area.name}</span>
                  <span
                    className="bs-small font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tone.chipBg, color: tone.chipText }}
                  >
                    {areaPercent}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-border/70 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${areaPercent}%`, backgroundColor: tone.bar }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contextGaps.length > 0 && (
        <div className="mt-5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4">
          <p className="bs-small font-bold text-[#854D0E] mb-2">Areas for deeper analysis</p>
          <div className="space-y-1.5">
            {contextGaps.slice(0, 5).map((gap, idx) => (
              <p key={`${idx}-${gap.slice(0, 24)}`} className="bs-small text-brand-midnight">
                • {gap}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
