import { TooltipIcon } from "@/components/ui/Tooltip";

interface ContextCoverageMeterProps {
  coveragePercent: number;
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

function getMeterColor(percent: number): string {
  if (percent >= 80) return "bg-[#34c759]";
  if (percent >= 60) return "bg-brand-blue";
  return "bg-[#ff9500]";
}

export function ContextCoverageMeter({ coveragePercent }: ContextCoverageMeterProps) {
  const context = getCoverageContext(coveragePercent);
  const meterColor = getMeterColor(coveragePercent);

  return (
    <section className="bs-card rounded-xl p-6 sm:p-7">
      <div className="flex justify-between items-center mb-1">
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
          <span className="bs-body-sm font-bold text-brand-muted tabular-nums">
            {coveragePercent}%
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-brand-border rounded-full overflow-hidden mt-3">
        <div
          className={`h-full rounded-full ${meterColor} transition-all duration-500 ease-out`}
          style={{ width: `${coveragePercent}%` }}
        />
      </div>
      <p className="bs-small text-brand-muted mt-3 leading-relaxed">
        {context.detail}
      </p>
    </section>
  );
}
