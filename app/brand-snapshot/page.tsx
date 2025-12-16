// app/brand-snapshot/page.tsx
// Entry page for the Brand Snapshot™ experience (kept minimal to avoid disrupting existing flow).

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BrandSnapshotPage() {
  return (
    <main style={{ padding: 40, fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
      <h1 style={{ color: "#021859", fontSize: 28, marginBottom: 12 }}>
        Brand Snapshot™
      </h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#0C1526" }}>
        Start your Brand Snapshot™ experience. If you already have a report link, you can
        view results immediately.
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/"
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
          Launch Brand Snapshot™ →
        </Link>
        <Link
          href="/brand-snapshot/plus"
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
          Learn about Snapshot+™ →
        </Link>
      </div>
    </main>
  );
}


