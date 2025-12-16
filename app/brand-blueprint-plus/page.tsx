// app/brand-blueprint-plus/page.tsx
// Blueprint+™ landing page (minimal stub).

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BrandBlueprintPlusPage() {
  return (
    <main style={{ padding: 40, fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
      <h1 style={{ color: "#021859", fontSize: 28, marginBottom: 12 }}>
        Brand Blueprint+™
      </h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6, color: "#0C1526" }}>
        Blueprint+™ is an expanded, implementation-ready package—built for founders who want
        a complete brand system and execution roadmap.
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/upgrade/blueprint"
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
          Continue →
        </Link>
        <Link
          href="/brand-blueprint"
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
          Back to Blueprint™
        </Link>
      </div>
    </main>
  );
}


