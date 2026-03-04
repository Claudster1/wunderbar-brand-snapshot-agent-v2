// components/results/SuiteCTA.tsx

import Link from "next/link";

export function SuiteCTA() {
  return (
    <div className="text-center pt-8">
      <Link
        href="/brand-snapshot-suite"
        className="bs-body-sm text-brand-blue font-bold underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
      >
        Explore the full WunderBrand Suite™ →
      </Link>
    </div>
  );
}
