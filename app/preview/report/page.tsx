// app/preview/report/page.tsx
// Dev preview: legacy Brand Snapshot report layout with mock data (no DB).

import Link from "next/link";
import SnapshotPlusUpsell from "@/components/SnapshotPlusUpsell";

export const dynamic = "force-dynamic";

const MOCK_REPORT = {
  business_name: "Acme Co",
  brand_alignment_score: 72,
  pillar_scores: {
    positioning: 16,
    messaging: 15,
    visibility: 14,
    credibility: 13,
    conversion: 14,
  },
  pillar_insights: {
    positioning:
      "You have a solid foundation for positioning. The next step is ensuring this positioning consistently shows up across every touchpoint.",
    messaging:
      "Your messaging is clear and mostly consistent. The opportunity is to make it even more compelling by focusing on outcomes and benefits.",
    visibility:
      "You're building visibility. The next step is to make your content more strategic—ensuring every piece supports your positioning and messaging.",
    credibility:
      "You're building credibility. The opportunity is to make this credibility more visible—ensure testimonials and case studies are easy to find.",
    conversion:
      "You have a solid conversion setup. The opportunity is to make your conversion process even smoother with lead magnets or nurture sequences.",
  },
  recommendations: [
    "Strengthen your visibility content strategy.",
    "Surface social proof more prominently.",
  ],
  snapshot_upsell: "",
};

function getInsightText(insight: unknown): string {
  if (typeof insight === "string") return insight;
  if (insight && typeof insight === "object") {
    const o = insight as { opportunity?: string; strength?: string; action?: string };
    return o.opportunity || o.strength || o.action || "No insight available.";
  }
  return "No insight available.";
}

export default function PreviewReportPage() {
  const reportId = "preview-mock";
  const {
    brand_alignment_score,
    pillar_scores,
    pillar_insights,
    recommendations,
    snapshot_upsell,
    business_name: businessName,
  } = MOCK_REPORT;

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

  return (
    <div style={{ padding: "0 24px 40px" }}>
      <style>{css}</style>

      <div style={{ maxWidth: "720px", margin: "24px auto 0", padding: "16px 20px", background: "#fff9e6", border: "2px solid #f5e6b3", borderRadius: "12px", fontSize: "0.875rem", color: "#8b6914" }}>
        <strong>Preview mode</strong> — Mock data. PDF download will not work.{" "}
        <Link href="/preview" className="underline font-semibold" style={{ color: "#021859" }}>
          ← All previews
        </Link>
      </div>

      <div className="report-container">
        <h1>Your Brand Snapshot™ Results</h1>
        <p>
          Here’s your personalized Brand Alignment Score™ and a concise breakdown of how your brand is
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
            const insight = pillar_insights[pillar];
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
