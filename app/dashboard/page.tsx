// app/dashboard/page.tsx
"use client";

import DashboardHistory from "@/components/dashboard/DashboardHistory";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";

export default function DashboardPage() {
  return (
    <main
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: NAVY, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Your Brand Reports
        </h1>
        <p style={{ fontSize: 15, color: SUB, margin: 0, lineHeight: 1.6 }}>
          Each report captures a moment in your brand&apos;s evolution. Revisit past insights or go further as your business grows.
        </p>
      </div>

      <DashboardHistory />

      {/* CTA to start a new assessment */}
      <div
        style={{
          marginTop: 40,
          padding: "24px 28px",
          borderRadius: 10,
          border: `1px dashed ${BLUE}40`,
          background: `${BLUE}04`,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, color: SUB, margin: "0 0 14px", lineHeight: 1.6 }}>
          Want a fresh perspective? Retake the assessment with updated information for a new analysis.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            borderRadius: 6,
            background: BLUE,
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Start a new Brand Snapshot™
        </a>
      </div>
    </main>
  );
}
