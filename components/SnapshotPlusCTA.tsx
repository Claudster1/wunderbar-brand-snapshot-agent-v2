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

      <Link href="/checkout/snapshot-plus?utm_source=wunderbar_app&utm_medium=results_cta&utm_campaign=snapshot_plus_upgrade&utm_content=snapshot_plus_cta" className="btn-primary mt-4">
        Take it further with Snapshot+™
      </Link>
    </section>
  );
}
