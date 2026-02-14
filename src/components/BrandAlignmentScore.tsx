// src/components/BrandAlignmentScore.tsx
// WunderBrand Score™ display section

import { BrandAlignmentGauge } from "@/components/dashboard/BrandAlignmentGauge";

interface BrandAlignmentScoreProps {
  brandAlignmentScore: number;
}

export function BrandAlignmentScore({ brandAlignmentScore }: BrandAlignmentScoreProps) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="bg-white border border-brand-border rounded-2xl p-10 text-center">
        <h2 className="text-xl font-semibold text-brand-navy mb-2">
          WunderBrand Score™
        </h2>

        <p className="text-sm text-brand-midnight mb-8 max-w-xl mx-auto">
          This score reflects how well your brand fundamentals work together —
          across positioning, messaging, visibility, credibility, and conversion.
        </p>

        <BrandAlignmentGauge score={brandAlignmentScore} />
      </div>
    </section>
  );
}
