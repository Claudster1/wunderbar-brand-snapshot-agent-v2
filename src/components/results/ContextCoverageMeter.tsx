// src/components/results/ContextCoverageMeter.tsx
// Context Coverage Meter for results page

import { TooltipIcon } from "@/components/ui/Tooltip";

interface ContextCoverageMeterProps {
  coveragePercent: number; // 0-100
}

export function ContextCoverageMeter({ coveragePercent }: ContextCoverageMeterProps) {
  return (
    <section className="bs-card rounded-xl p-6 sm:p-7">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="bs-h4 text-brand-navy">
            Context Coverage
          </span>
          <TooltipIcon
            content={
              <>
                How much of your brand context we had to work with (website, answers, etc.). Higher coverage means sharper, more tailored insights. Snapshot+™ can deepen this with more inputs.
              </>
            }
          />
        </div>
        <span className="bs-body-sm font-bold text-brand-muted tabular-nums">
          {coveragePercent}%
        </span>
      </div>
      <div className="h-2.5 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-blue transition-all duration-500 ease-out"
          style={{ width: `${coveragePercent}%` }}
        />
      </div>
      {coveragePercent < 80 && (
        <p className="bs-small text-brand-muted mt-3">
          Deeper inputs unlock sharper insights in Snapshot+™
        </p>
      )}
    </section>
  );
}
