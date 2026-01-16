// src/components/results/BrandScoreGauge.tsx
// Brand Alignment Score hero visual component (large gauge)

import { ScoreGauge } from "@/src/components/ScoreGauge";
import { rolePhrase } from "@/src/lib/roleLanguage";
import { UserRoleContext } from "@/src/types/snapshot";

interface BrandScoreGaugeProps {
  score: number; // 0-100
  userRoleContext?: UserRoleContext;
}

export function BrandScoreGauge({ score, userRoleContext }: BrandScoreGaugeProps) {
  return (
    <section className="text-center">
      <h1 className="text-3xl font-semibold text-brand-navy mb-6">
        Brand Alignment Score™
      </h1>
      <div className="flex justify-center mb-6">
        <div className="scale-150">
          <ScoreGauge value={score} />
        </div>
      </div>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Your brand's overall alignment across positioning, messaging, visibility,
        credibility, and conversion.
      </p>
      <p className="text-sm text-muted mt-4">
        {userRoleContext ? (
          <>Built to support you in {rolePhrase(userRoleContext)} with clear priorities and next steps.</>
        ) : (
          <>Built to support you with clear priorities and next steps.</>
        )}
      </p>
      {userRoleContext && (
        <p className="text-xs text-muted mt-2">
          Focused on the areas most impactful for {rolePhrase(userRoleContext)}.
        </p>
      )}
    </section>
  );
}
