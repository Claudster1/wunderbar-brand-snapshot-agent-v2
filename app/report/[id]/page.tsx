// app/report/[id]/page.tsx

import { createClient } from "@supabase/supabase-js";
import SnapshotPlusUpsell from "@/components/SnapshotPlusUpsell";
import { BlueprintPlusHeader } from "@/components/reports/BlueprintPlusHeader";
import { ScoreGauge } from "@/src/components/ScoreGauge";

export const dynamic = "force-dynamic";
const SAMPLE_LEGACY_REPORTS: Record<string, any> = {
  "sample-ecommerce": {
    report_id: "sample-ecommerce",
    business_name: "Lumen & Co.",
    user_email: "sample@wunderbar.ai",
    brand_alignment_score: 58,
    pillar_scores: {
      positioning: 61,
      messaging: 57,
      visibility: 62,
      credibility: 55,
      conversion: 52,
    },
    pillar_insights: {
      positioning:
        "Your visual identity is distinctive and recognizable, but your unique value is not explicit enough in product copy.",
      messaging:
        "Tone is on-brand and consistent, while product pages still need clearer problem-solution framing.",
      visibility:
        "Organic and social traffic volume is healthy, but channel mix is not prioritized by conversion quality.",
      credibility:
        "Customer sentiment is positive, but trust signals are buried below the fold on key pages.",
      conversion:
        "Cart initiation is acceptable, but checkout friction and weak urgency cues reduce completion rate.",
    },
    snapshot_upsell:
      "Unlock your full Snapshot+ strategy to close conversion gaps and improve trust placement.",
  },
  "sample-service-b2b": {
    report_id: "sample-service-b2b",
    business_name: "Northlight Advisory",
    user_email: "sample@wunderbar.ai",
    brand_alignment_score: 63,
    pillar_scores: {
      positioning: 59,
      messaging: 66,
      visibility: 54,
      credibility: 72,
      conversion: 64,
    },
    pillar_insights: {
      positioning:
        "Your offer is differentiated deeper in the funnel, but top-of-funnel clarity needs to be stronger.",
      messaging:
        "Your narrative is outcome-oriented, while several pages still read feature-first.",
      visibility:
        "Referral quality is strong, but search and LinkedIn discovery are under-leveraged.",
      credibility:
        "Case-study proof is strong, but trust signals are not consistently front-loaded.",
      conversion:
        "Qualified conversion is healthy, but visitors drop pre-booking due to weak next-step clarity.",
    },
    snapshot_upsell: "Upgrade to Snapshot+ for deeper audience and implementation guidance.",
  },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: reportId } = await params;

  if (!reportId) {
    return (
      <div className="p-10 text-red-600 text-center">
        Missing report ID.
      </div>
    );
  }

  let report = SAMPLE_LEGACY_REPORTS[reportId] || null;
  let error: any = null;

  if (!report) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const queryResult = await supabase
        .from("brand_snapshot_reports")
        .select("*")
        .eq("report_id", reportId)
        .single();
      report = queryResult.data;
      error = queryResult.error;
    }
  }

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

    .brand-lockup {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-bottom: 14px;
    }

    .brand-lockup img {
      width: 170px;
      height: auto;
      display: block;
    }

    .brand-lockup span {
      font-size: 11px;
      color: #5A6B7E;
    }

    .action-bar {
      position: sticky;
      top: 84px;
      z-index: 60;
      margin-bottom: 18px;
      padding: 12px;
      border: 1px solid #D6DFE8;
      border-radius: 10px;
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(4px);
    }

    .action-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .action-brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      margin-bottom: 8px;
    }

    .action-brand img {
      width: 170px;
      height: auto;
      display: block;
    }

    .action-brand-note {
      font-size: 11px;
      color: #5A6B7E;
    }

    .action-brand-note strong {
      color: #07B0F2;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid #D6DFE8;
      color: #021859;
      background: #fff;
    }

    .action-btn.primary {
      background: #07B0F2;
      color: #fff;
      border-color: #07B0F2;
    }

    .jump-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .jump-links a {
      text-decoration: none;
      color: #5A6B7E;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 9px;
      border-radius: 6px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
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

    .meter-track {
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: #D6E4FB;
      overflow: hidden;
      margin-top: 12px;
    }

    .meter-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #07B0F2 0%, #021859 100%);
      transition: width 0.4s ease;
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
  const weakestPillar =
    Object.entries(pillar_scores || {})
      .filter((entry): entry is [string, number] => typeof entry[1] === "number")
      .sort((a, b) => a[1] - b[1])[0]?.[0] || "positioning";

  return (
    <div>
      <style>{css}</style>

      <div className="report-container">
        <BlueprintPlusHeader
          productName="WunderBrand Snapshot™"
          reportId={reportId}
          userEmail={typeof (report as any).user_email === "string" ? (report as any).user_email : undefined}
          pdfHref={`/api/snapshot/pdf?id=${encodeURIComponent(reportId)}`}
          utmMedium="legacy_report"
        />

        <div style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Executive Summary</h2>
          <p>
            Your current alignment is {score}/100. This high-level overview summarizes your
            WunderBrand Score™, pillar performance, and the strongest near-term priority in{" "}
            <strong>{pillarDisplay[weakestPillar as keyof typeof pillarDisplay] || "Positioning"}</strong>.
          </p>
        </div>

        <div id="score-overview" className="score-card">
          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <ScoreGauge value={score} showLegend />
          </div>
          <p style={{ marginTop: 10 }}>{scoreLabel}</p>
        </div>

        <h2 id="pillar-analysis">How Your Brand Performs Across the Five Pillars</h2>
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

        {recommendationsList.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0 }}>Priority Actions</h2>
            <div>
              {recommendationsList.slice(0, 5).map((item, idx) => (
                <p key={`${idx}-${item.slice(0, 30)}`}>
                  {idx + 1}. {item}
                </p>
              ))}
            </div>
          </div>
        )}

        <div id="next-steps">
          <SnapshotPlusUpsell
            href="/checkout/snapshot-plus"
            copy={
              typeof snapshot_upsell === "string" && snapshot_upsell.trim().length > 0
                ? snapshot_upsell
                : undefined
            }
            businessName={businessName}
          />
        </div>
      </div>

      <footer>Powered by Wunderbar Digital · © 2025 All Rights Reserved</footer>
    </div>
  );
}
