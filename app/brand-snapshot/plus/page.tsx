// app/brand-snapshot/plus/page.tsx
// Snapshot+™ landing page (minimal stub; checkout handled elsewhere).

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BrandSnapshotPlusPage() {
  return (
    <main style={{ padding: 40, fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
      <h1 style={{ color: "#021859", fontSize: 28, marginBottom: 12 }}>
        Brand Snapshot+™
      </h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#0C1526" }}>
        Snapshot+™ expands your Brand Snapshot™ into a deeper, consulting-style deliverable:
        richer insights, clearer priorities, and a more actionable roadmap.
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/checkout/snapshot-plus"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 8,
            background: "#07B0F2",
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Continue to Checkout →
        </Link>
        <Link
          href="/brand-snapshot"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #E1E5EE",
            color: "#021859",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Back to Brand Snapshot™
        </Link>
      </div>
    </main>
  );
}


