// app/dashboard/page.tsx
"use client";

import DashboardHistory from "@/components/dashboard/DashboardHistory";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import RetakeCTA from "@/components/dashboard/RetakeCTA";

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

      {/* Score trend chart — only renders when 2+ assessments exist */}
      <ScoreTrendChart />

      <DashboardHistory />

      {/* Retake/Refresh CTA — adapts based on user's purchased tier */}
      <RetakeCTA />
    </main>
  );
}
