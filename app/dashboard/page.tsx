"use client";

import DashboardHistory from "@/components/dashboard/DashboardHistory";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import RetakeCTA from "@/components/dashboard/RetakeCTA";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";

export default function DashboardPage() {
  return (
    <main
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: NAVY,
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
          }}
        >
          My Deliverables
        </h1>
        <p style={{ fontSize: 15, color: SUB, margin: 0, lineHeight: 1.6 }}>
          All your brand reports, PDFs, and deliverables in one place.
          {" "}Manage multiple brands, track score evolution, and download reports anytime.
        </p>
      </div>

      {/* Score trend (only renders with 2+ data points) */}
      <ScoreTrendChart />

      {/* Reports section */}
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>
            Reports &amp; PDFs
          </h2>
          <a
            href="/brand-snapshot"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              background: BLUE,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            + New brand diagnostic
          </a>
        </div>
        <DashboardHistory />
      </section>

      <RetakeCTA />
    </main>
  );
}
