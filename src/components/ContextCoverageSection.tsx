// src/components/ContextCoverageSection.tsx
// Context coverage section component

import { CoverageMeter } from "./CoverageMeter";

interface ContextCoverageSectionProps {
  coverageScore: number;
}

export function ContextCoverageSection({ coverageScore }: ContextCoverageSectionProps) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="bg-gray-50 rounded-xl p-8">
        <h4 className="font-semibold text-brand-navy mb-2">
          Context Coverage
        </h4>

        <p className="text-sm text-brand-midnight max-w-3xl mb-4">
          Your results are based on the information you shared today.
          Deeper insights become possible when we can analyze additional context
          like live pages, social presence, and messaging patterns.
        </p>

        <CoverageMeter value={coverageScore} />
      </div>
    </section>
  );
}
