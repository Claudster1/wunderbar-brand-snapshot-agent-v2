// app/report/[id]/page.tsx

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const reportId = params.id;

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
  } = report;

  /* ------------------------------------------------------------------
     INLINE STYLES (Deal.ai compatible)
  ------------------------------------------------------------------ */
  const css = `
    .page-wrap {
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 20px;
      font-family: Helvetica Neue, sans-serif;
      color: #0C1526;
    }
    h1,h2,h3 { color: #021859; margin-bottom: 8px; }
    .score-card {
      margin-top: 32px;
      padding: 28px;
      border-radius: 10px;
      border: 1px solid #E0E3EA;
      background: #FFFFFF;
      box-shadow: 0 8px 24px rgba(2,24,89,0.06);
      opacity: 0;
      animation: fadeIn 0.8s ease forwards;
    }
    .big-score {
      font-size: 64px;
      font-weight: 700;
      color: #021859;
    }
    .meter-track {
      width: 100%;
      height: 10px;
      background: #E0E3EA;
      border-radius: 6px;
      margin-top: 12px;
      overflow: hidden;
    }
    .meter-fill {
      height: 10px;
      background: #07B0F2;
      width: 0%;
      animation: growMeter 1.4s ease forwards;
    }
    .pillars-grid {
      margin-top: 32px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
    }
    .pillar-card {
      padding: 18px 22px;
      border-radius: 8px;
      border: 1px solid #E0E3EA;
      background: #FAFBFF;
      opacity: 0;
      animation: fadeInUp 0.65s ease forwards;
    }
    .pillar-title {
      font-size: 18px;
      font-weight: 600;
      color: #021859;
      margin-bottom: 6px;
    }
    .pillar-meter {
      width: 100%;
      height: 8px;
      background: #E0E3EA;
      border-radius: 4px;
      margin: 10px 0;
      overflow: hidden;
    }
    .pillar-fill {
      height: 8px;
      background: #07B0F2;
      width: 0%;
      animation: growMeter 1.3s ease forwards;
    }
    .insight-text {
      font-size: 15px;
      line-height: 1.55;
      margin-top: 8px;
      color: #333;
    }
    .recommend-box {
      margin-top: 42px;
      padding: 26px;
      border-radius: 10px;
      background: #FFFFFF;
      border: 1px solid #E0E3EA;
      box-shadow: 0 8px 24px rgba(2,24,89,0.06);
      opacity: 0;
      animation: fadeIn 1s ease forwards;
    }
    .recommend-box ul {
      margin-top: 12px;
      padding-left: 20px;
    }
    .snapshot-plus {
      margin-top: 48px;
      padding: 36px;
      border-radius: 10px;
      background: #021859;
      color: #FFFFFF;
      text-align: center;
      opacity: 0;
      animation: fadeIn 1.1s ease forwards;
    }
    .plus-btn {
      display: inline-block;
      margin-top: 18px;
      padding: 14px 24px;
      background: #07B0F2;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(7,176,242,0.28);
    }
    .plus-btn:hover {
      background: #059BD8;
    }
    @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes growMeter {
      from { width: 0%; }
      to { width: 100%; }
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

  return (
    <div className="page-wrap">
      <style>{css}</style>

      {/* HEADER */}
      <h1>Your Brand Snapshot™ Results</h1>
      <p>
        This report is based on your inputs and analyzed through the Brand Alignment Score™ framework.  
        Your results highlight strengths, opportunities, and the most impactful next steps for your brand.
      </p>

      {/* SCORE CARD */}
      <div className="score-card">
        <h2>Brand Alignment Score™</h2>
        <div className="big-score">{brand_alignment_score || 0}</div>

        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${brand_alignment_score || 0}%` }}
          />
        </div>
      </div>

      {/* PILLARS */}
      <div className="pillars-grid">
        {Object.entries(pillar_scores || {}).map(([pillar, value]: [string, any], index) => {
          const insight = pillar_insights?.[pillar];
          const insightText = getInsightText(insight);
          
          return (
            <div className="pillar-card" key={pillar} style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="pillar-title">
                {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
              </div>

              <div className="pillar-meter">
                <div
                  className="pillar-fill"
                  style={{ width: `${(value / 20) * 100}%` }}
                />
              </div>

              <div className="insight-text">{insightText}</div>
            </div>
          );
        })}
      </div>

      {/* RECOMMENDATIONS */}
      {recommendationsList.length > 0 && (
        <div className="recommend-box">
          <h2>Top Recommendations</h2>
          <ul>
            {recommendationsList.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SNAPSHOT+ PANEL */}
      <div className="snapshot-plus">
        <h2>Unlock Your Full Brand Strategy with Snapshot+™</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          Take your insights further with a deeper analysis of messaging, audience clarity,  
          brand voice refinement, visual direction, and a personalized roadmap.  
          Upgrade to Snapshot+™ for a complete brand clarity experience.
        </p>

        <Link href="/upgrade/snapshot-plus" className="plus-btn">
          Upgrade to Snapshot+™ →
        </Link>
      </div>

      {/* DOWNLOAD PDF */}
      <p style={{ marginTop: "32px" }}>
        <a
          href={`/api/report/pdf?id=${params.id}`}
          style={{ textDecoration: "underline", color: "#021859" }}
        >
          Download PDF →
        </a>
      </p>
    </div>
  );
}
