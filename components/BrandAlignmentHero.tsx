// components/BrandAlignmentHero.tsx
// Hero section displaying WunderBrand Score™

import { ScoreGauge } from "@/src/components/ScoreGauge";

export function BrandAlignmentHero({
  score,
  brandName
}: {
  score: number;
  brandName: string;
}) {
  return (
    <section className="card text-center">
      <h1 className="text-2xl font-semibold mb-2">
        {brandName}'s WunderBrand Score™
      </h1>

      <ScoreGauge value={score} />

      <p className="text-sm mt-4 text-muted">
        This score reflects how clearly, consistently, and confidently your brand
        is showing up today.
      </p>
    </section>
  );
}
