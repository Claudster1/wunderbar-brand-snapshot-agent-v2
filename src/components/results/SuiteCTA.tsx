// components/results/SuiteCTA.tsx

import { WUNDERBAR_SUITE_COMPARE_URL } from "@/lib/wunderbarExternalUrls";

export function SuiteCTA() {
  return (
    <div className="text-center pt-2 sm:pt-3">
      <a
        href={WUNDERBAR_SUITE_COMPARE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="bs-body-sm text-brand-blue font-bold underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
      >
        Explore the full WunderBrand Suite™ →
      </a>
    </div>
  );
}
