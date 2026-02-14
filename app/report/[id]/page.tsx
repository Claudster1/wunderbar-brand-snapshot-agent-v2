// app/report/[id]/page.tsx

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import SnapshotPlusUpsell from "@/components/SnapshotPlusUpsell";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: reportId } = await params;
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)!,
    { auth: { persistSession: false } }
  );

  if (!reportId) {
    return (
      <div className="p-10 text-red-600 text-center">
        Missing report ID.
      </div>
    );
  }

  // 🧠 Fetch the report from Supabase
  const { data: report, error } = await supabase
    .from("brand_snapshot_reports")
    .select("*")
    .eq("report_id", reportId)
    .single();

  if (error || !report) {
    return (
      <div style={{ padding: "40px", fontFamily: "Helvetica Neue, sans-serif" }}>
        <h1 style={{ fontSize: "24px", color: "#021859" }}>Report not found</h1>
        <p>Please check your link or contact support.</p>
      </div>
    );
  }

  const {
    brand_alignment_score,
    pillar_scores,
    pillar_insights,
    recommendations,
    full_report,
    snapshot_upsell,
  } = report;

  // Extract business name from report or full_report
  const businessName = (report as any).business_name || 
                       (report as any).businessName || 
                       (full_report as any)?.businessName || 
                       (full_report as any)?.business_name;

  /* ------------------------------------------------------------------
     INLINE STYLES (Deal.ai compatible)
  ------------------------------------------------------------------ */
  const css = `
    body {
      margin: 0;
      padding: 0;
      background: #F7F9FC;
      font-family: "Helvetica Neue", Arial, sans-serif;
      color: #0C1526;
    }

    .report-container {
      max-width: 720px;
      margin: 40px auto;
      padding: 24px;
      background: #FFF;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(2,24,89,0.08);
      opacity: 0;
      transform: translateY(20px);
      animation: fadeUp 0.8s ease-out forwards;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    h1 {
      font-size: 1.9rem;
      font-weight: 600;
      color: #021859;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #021859;
      margin-top: 32px;
      margin-bottom: 12px;
    }

    p {
      line-height: 1.55;
      font-size: 1rem;
      color: #0C1526;
    }

    .score-card {
      background: #F2F7FF;
      border-left: 4px solid #07B0F2;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      opacity: 0;
      animation: fadeUp 0.8s ease-out 0.25s forwards;
    }

    .score-number {
      font-size: 2.8rem;
      font-weight: 700;
      color: #021859;
      margin-bottom: 6px;
    }

    .pillars { margin-top: 28px; }

    .pillar {
      background: #FFF;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #E1E5EE;
      margin-bottom: 16px;
      opacity: 0;
      animation: fadeUp 0.8s ease-out forwards;
    }
    .pillar:nth-child(1){animation-delay:0.30s;}
    .pillar:nth-child(2){animation-delay:0.40s;}
    .pillar:nth-child(3){animation-delay:0.50s;}
    .pillar:nth-child(4){animation-delay:0.60s;}
    .pillar:nth-child(5){animation-delay:0.70s;}

    .pillar-title {
      font-weight: 600;
      font-size: 1.05rem;
      margin-bottom: 6px;
      color: #021859;
    }

    .upgrade-box {
      margin-top: 40px;
      padding: 28px;
      background: #021859;
      color: white;
      border-radius: 12px;
      text-align: center;
      opacity: 0;
      animation: fadeUp 0.8s ease-out 0.9s forwards;
    }

    .upgrade-box h2 { color: #FFF; margin-top: 0; }

    .upgrade-btn {
      display: inline-block;
      background: #07B0F2;
      color: #FFF;
      padding: 14px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 16px;
      box-shadow: 0 6px 22px rgba(7,176,242,0.35);
    }
    .upgrade-btn:hover { background: #059BD8; }

    footer {
      text-align: center;
      color: #64748B;
      font-size: 0.85rem;
      margin: 40px auto 20px;
      max-width: 720px;
    }
  `;

  // Handle both old (string) and new (object) insight formats
  const getInsightText = (insight: any): string => {
    if (typeof insight === 'string') {
      return insight;
    }
    if (insight && typeof insight === 'object') {
      return insight.opportunity || insight.strength || insight.action || "No insight available.";
    }
    return "No insight available.";
  };

  // Handle recommendations - can be array or object
  const recommendationsList = Array.isArray(recommendations) 
    ? recommendations 
    : recommendations && typeof recommendations === 'object'
    ? Object.values(recommendations).filter((r: any) => typeof r === 'string')
    : [];

  const score = typeof brand_alignment_score === "number" ? brand_alignment_score : 0;
  const scoreLabel =
    score >= 80
      ? "Excellent alignment — strong clarity and consistency"
      : score >= 60
      ? "Strong foundation with high potential to refine and scale"
      : score >= 40
      ? "Developing foundation — clarity gains will unlock momentum"
      : "Needs focus — tightening clarity will lift performance quickly";

  const pillarOrder = ["positioning", "messaging", "visibility", "credibility", "conversion"] as const;
  const pillarDisplay: Record<(typeof pillarOrder)[number], string> = {
    positioning: "Positioning",
    messaging: "Messaging",
    visibility: "Visibility",
    credibility: "Credibility",
    conversion: "Conversion",
  };

  return (
    <div>
      <style>{css}</style>

      <div className="report-container">
        <h1>Your WunderBrand Snapshot™ Results</h1>
        <p>
          Here’s your personalized WunderBrand Score™ and a concise breakdown of how your brand is
          performing across the five strategic pillars. Each insight is tailored to help you understand
          where you’re strong today — and where small refinements can unlock clarity, consistency, and conversion.
        </p>

        <div className="score-card">
          <div className="score-number">{score}</div>
          <p>{scoreLabel}</p>
        </div>

        <h2>How Your Brand Performs Across the Five Pillars</h2>
        <div className="pillars">
          {pillarOrder.map((pillar) => {
            const insight = (pillar_insights as any)?.[pillar];
            const insightText = getInsightText(insight);
            return (
              <div className="pillar" key={pillar}>
                <div className="pillar-title">{pillarDisplay[pillar]}</div>
                <p>{insightText}</p>
              </div>
            );
          })}
        </div>

        <SnapshotPlusUpsell
          href="/checkout/snapshot-plus"
          copy={
            typeof snapshot_upsell === "string" && snapshot_upsell.trim().length > 0
              ? snapshot_upsell
              : undefined
          }
          businessName={businessName}
        />

        <p style={{ marginTop: "24px" }}>
          <a
            href={`/api/report/pdf?id=${reportId}`}
            style={{ textDecoration: "underline", color: "#021859" }}
          >
            Download PDF →
          </a>
        </p>
      </div>

      <footer>Powered by Wunderbar Digital · © 2025 All Rights Reserved</footer>
    </div>
  );
}
