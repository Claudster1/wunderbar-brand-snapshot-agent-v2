// components/results/PrimaryCTA.tsx
// CTA component for primary pillar

import { PillarKey } from "@/src/lib/pillars/pillarCopy";
import { rolePhrase } from "@/src/lib/roleLanguage";
import type { UserRoleContext } from "@/src/types/snapshot";

interface PrimaryCTAProps {
  pillar: PillarKey;
  userRoleContext?: string;
}

function PrimaryCTA({ pillar, userRoleContext }: PrimaryCTAProps) {
  return (
    <div className="mt-4 rounded-lg bg-white border border-brand-border p-4">
      <p className="text-sm font-medium text-brand-navy mb-2">
        Want to strengthen this area?
      </p>

      <p className="text-sm text-slate-600 mb-4">
        Snapshot+™ builds directly on your results, translating them into clear priorities
        {userRoleContext ? (
          <> designed to support you in {rolePhrase(userRoleContext as UserRoleContext)} — not abstract brand theory.</>
        ) : (
          <> designed to support you — not abstract brand theory.</>
        )}
      </p>

      <a
        href="/snapshot-plus"
        className="inline-flex items-center px-5 py-2.5 rounded-md bg-brand-blue text-white font-medium hover:bg-brand-blueHover transition"
      >
        Unlock Snapshot+™ →
      </a>
    </div>
  );
}

export { PrimaryCTA };
