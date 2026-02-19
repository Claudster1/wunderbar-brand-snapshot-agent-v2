"use client";

export default function SnapshotPlusPanel({ score }: { score?: number }) {
  return (
    <div className="mt-12 rounded-lg border border-brand-border p-8 bg-white shadow-md">
      <h2 className="text-2xl font-semibold text-brand-navy">
        Your Complete Snapshot+™ Report
      </h2>

      <p className="mt-3 text-brand-midnight leading-relaxed">
        Your WunderBrand Score™ is just the beginning. Snapshot+™ gives you personalized
        insights, strategic recommendations, a guided action plan, and AI-ready brand assets — all
        based on your unique brand data.
      </p>

      <a
        href="/snapshot-plus"
        className="inline-block mt-6 px-6 py-3 bg-brand-blue text-white rounded-lg shadow hover:bg-brand-blueHover transition"
      >
        Take it further with Snapshot+™ →
      </a>
    </div>
  );
}


