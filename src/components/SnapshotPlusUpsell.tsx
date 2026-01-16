// src/components/SnapshotPlusUpsell.tsx
// Snapshot+ upsell section component

import { rolePhrase } from "@/src/lib/roleLanguage";

interface SnapshotPlusUpsellProps {
  userRoleContext?: string;
}

export function SnapshotPlusUpsell({ userRoleContext }: SnapshotPlusUpsellProps = {}) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="border border-brand-border rounded-2xl p-10 bg-white">
        <h3 className="text-2xl font-semibold text-brand-navy mb-4">
          Turn your results into direction
        </h3>

        <p className="text-[15px] text-brand-midnight max-w-3xl mb-8">
          Snapshot+™ builds directly on your results, translating them into clear priorities
          {userRoleContext ? (
            <> designed to support you in {rolePhrase(userRoleContext)} — not abstract brand theory.</>
          ) : (
            <> designed to support you — not abstract brand theory.</>
          )}
        </p>

        <ul className="text-sm text-brand-midnight space-y-2 mb-8">
          <li>• Expanded insights for each pillar</li>
          <li>• Priority focus based on your results</li>
          <li>• Visibility guidance including AEO opportunities</li>
          <li>• A clearer path forward — without guesswork</li>
        </ul>

        <a href="/snapshot-plus" className="btn-primary">
          See how to strengthen what matters most right now →
        </a>
      </div>
    </section>
  );
}
