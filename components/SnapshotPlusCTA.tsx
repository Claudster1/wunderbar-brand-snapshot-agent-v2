// components/SnapshotPlusCTA.tsx
// Snapshot+™ upgrade CTA component
import Link from "next/link";

export function SnapshotPlusCTA({ pillar }: { pillar: string }) {
  return (
    <section className="cta-card">
      <h3>Turn your results into direction</h3>
      <p className="text-sm mt-2">
        Snapshot+™ expands this insight into a prioritized, actionable brand plan.
      </p>

      <Link href="/snapshot-plus" className="btn-primary mt-4">
        Take it further with Snapshot+™
      </Link>
    </section>
  );
}
