// src/components/results/BrandScoreGauge.tsx
// Brand Alignment Score hero visual component (large gauge)

import { ScoreGauge } from "@/src/components/ScoreGauge";
import { rolePhrase } from "@/src/lib/roleLanguage";
import { UserRoleContext } from "@/src/types/snapshot";
import { TooltipIcon } from "@/components/ui/Tooltip";

interface BrandScoreGaugeProps {
  score: number; // 0-100
  userRoleContext?: UserRoleContext;
}

export function BrandScoreGauge({ score, userRoleContext }: BrandScoreGaugeProps) {
  return (
    <section className="text-center px-4 py-6 sm:py-8">
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
        <h1 className="bs-h1">
          Brand Alignment Score™
        </h1>
        <TooltipIcon
          content={
            <>
              Your overall alignment across all five pillars (positioning, messaging, visibility, credibility, conversion). 0–100 scale: higher means your brand is clearer and more consistent. The needle shows where you land; green = strong, red = biggest opportunity.
            </>
          }
        />
      </div>

      <div className="flex justify-center mt-4 mb-5 sm:mb-6 min-h-0">
        <ScoreGauge value={score} />
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <p className="bs-body-sm text-brand-muted">
          Your brand&apos;s overall alignment across positioning, messaging, visibility,
          credibility, and conversion.
        </p>
        <p className="bs-body-sm text-brand-muted">
          {userRoleContext ? (
            <>Built to support you in {rolePhrase(userRoleContext)} with clear priorities and next steps.</>
          ) : (
            <>Built to support you with clear priorities and next steps.</>
          )}
        </p>
        {userRoleContext && (
          <p className="bs-small text-brand-muted">
            Focused on the areas most impactful for {rolePhrase(userRoleContext)}.
          </p>
        )}
      </div>
    </section>
  );
}
