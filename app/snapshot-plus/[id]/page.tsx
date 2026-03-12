// app/snapshot-plus/[id]/page.tsx

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { VocSurveyCTA } from "@/components/voc/VocSurveyCTA";
import { ShareButton } from "@/components/share/ShareButton";
import { BlueprintPlusHeader } from "@/components/reports/BlueprintPlusHeader";
import { ScoreGauge } from "@/src/components/ScoreGauge";

export const dynamic = "force-dynamic";

const SAMPLE_SNAPSHOT_PLUS_REPORTS: Record<string, any> = {
  "sample-service-b2b": {
    business_name: "Northlight Advisory",
    industry: "B2B Services",
    brand_alignment_score: 71,
    pillar_scores: {
      positioning: 16,
      messaging: 14,
      visibility: 13,
      credibility: 15,
      conversion: 13,
    },
    pillar_insights: {
      positioning: "Clear value proposition, but not consistently surfaced in top-of-funnel assets.",
      messaging: "Narrative is strong, but proof integration is still inconsistent.",
      visibility: "Good referral quality; organic and channel distribution need stronger sequencing.",
      credibility: "Case-study assets exist, but trust signals are not consistently front-loaded.",
      conversion: "Qualified intent is present, but CTA pathways and urgency framing can be improved.",
    },
    enriched_persona:
      "Strategic, insight-led buyers who need confidence in outcomes before they commit.",
    enriched_archetype: {
      name: "The Sage",
      summary:
        "Lead with clarity and evidence. Your strongest growth lever is translating expertise into visible trust signals.",
    },
    enriched_voice: {
      summary:
        "Confident, clear, and practical. Keep language specific and outcome-first.",
      pillars: ["Evidence-backed", "Commercially grounded", "Direct but warm"],
    },
    enriched_color_palette: [
      { name: "Signal Blue", hex: "#07B0F2", role: "Primary", meaning: "Clarity and momentum" },
      { name: "Trust Navy", hex: "#021859", role: "Anchor", meaning: "Authority and confidence" },
    ],
    opportunities_map:
      "Top opportunities: sharpen first-impression clarity, elevate proof placement, and simplify conversion pathways.",
    roadmap_30: "Refine homepage hero, reposition proof blocks, and align CTA sequence.",
    roadmap_60: "Deploy authority content cadence and optimize high-intent landing journeys.",
    roadmap_90: "Scale top-performing channels and standardize message architecture across assets.",
    content_format_channel_snapshot:
      "Prioritize authority-led short-form insights and case-based long-form content distributed through LinkedIn and search.",
    marketing_spend_audit_signal:
      "Current spend should shift toward channels with higher trust transfer and lower qualification friction.",
    competitive_vulnerability_signal:
      "Biggest exposure is in comparison moments where competitors present proof earlier and more explicitly.",
    revenue_impact_statement:
      "Improving trust signal placement and CTA clarity can lift qualified conversion efficiency within one quarter.",
    brand_opportunities:
      "Clarify the first 5 seconds of value and align all demand paths to one confident narrative.",
    full_report: {},
    user_email: "sample@wunderbar.ai",
  },
  "sample-ecommerce": {
    business_name: "Lumen & Co.",
    industry: "Ecommerce",
    brand_alignment_score: 64,
    pillar_scores: {
      positioning: 15,
      messaging: 13,
      visibility: 14,
      credibility: 12,
      conversion: 10,
    },
    pillar_insights: {
      positioning: "Distinctive identity, but product-level differentiation needs sharper framing.",
      messaging: "Tone is strong, but key objections are not resolved early enough.",
      visibility: "Traffic is healthy; channel prioritization by profitability is the next lever.",
      credibility: "Trust proof exists, but appears too late in the journey.",
      conversion: "Checkout and next-step sequencing are suppressing completion.",
    },
    enriched_persona:
      "Style-conscious buyers who convert when trust and clarity are visible before checkout friction.",
    enriched_archetype: {
      name: "The Creator",
      summary:
        "Your edge is identity and expression. Pair it with explicit commercial proof to improve conversion confidence.",
    },
    enriched_voice: {
      summary:
        "Expressive and premium, with clearer outcome framing and confidence-building proof.",
      pillars: ["Aspirational", "Specific", "Trust-building"],
    },
    enriched_color_palette: [
      { name: "Brand Blue", hex: "#07B0F2", role: "Primary", meaning: "Clarity and action" },
      { name: "Midnight", hex: "#021859", role: "Anchor", meaning: "Trust and depth" },
    ],
    opportunities_map:
      "Top opportunities: trust-first merchandising, objection-aware product copy, and checkout friction reduction.",
    roadmap_30: "Improve product-page proof hierarchy and tighten CTA clarity.",
    roadmap_60: "Refactor top categories by conversion quality and buyer intent stage.",
    roadmap_90: "Scale profitable channels with standardized conversion playbooks.",
    content_format_channel_snapshot:
      "Blend social proof reels, creator stories, and comparison-focused PDP modules.",
    marketing_spend_audit_signal:
      "Reallocate spend from broad reach to high-intent retargeting and trust-led conversion assets.",
    competitive_vulnerability_signal:
      "Competitors that surface social proof earlier will continue to win checkout confidence.",
    revenue_impact_statement:
      "Reducing checkout friction and improving trust visibility can materially improve ROAS and margin.",
    brand_opportunities:
      "Unify brand expression with conversion architecture so creative strength also drives revenue efficiency.",
    full_report: {},
    user_email: "sample@wunderbar.ai",
  },
  // Keep compatibility with existing sample links used in QA/docs.
  "sample-ecommerce-plus": {
    business_name: "Lumen & Co.",
    industry: "Ecommerce",
    brand_alignment_score: 64,
    pillar_scores: {
      positioning: 15,
      messaging: 13,
      visibility: 14,
      credibility: 12,
      conversion: 10,
    },
    pillar_insights: {
      positioning: "Distinctive identity, but product-level differentiation needs sharper framing.",
      messaging: "Tone is strong, but key objections are not resolved early enough.",
      visibility: "Traffic is healthy; channel prioritization by profitability is the next lever.",
      credibility: "Trust proof exists, but appears too late in the journey.",
      conversion: "Checkout and next-step sequencing are suppressing completion.",
    },
    enriched_persona:
      "Style-conscious buyers who convert when trust and clarity are visible before checkout friction.",
    enriched_archetype: {
      name: "The Creator",
      summary:
        "Your edge is identity and expression. Pair it with explicit commercial proof to improve conversion confidence.",
    },
    enriched_voice: {
      summary:
        "Expressive and premium, with clearer outcome framing and confidence-building proof.",
      pillars: ["Aspirational", "Specific", "Trust-building"],
    },
    enriched_color_palette: [
      { name: "Brand Blue", hex: "#07B0F2", role: "Primary", meaning: "Clarity and action" },
      { name: "Midnight", hex: "#021859", role: "Anchor", meaning: "Trust and depth" },
    ],
    opportunities_map:
      "Top opportunities: trust-first merchandising, objection-aware product copy, and checkout friction reduction.",
    roadmap_30: "Improve product-page proof hierarchy and tighten CTA clarity.",
    roadmap_60: "Refactor top categories by conversion quality and buyer intent stage.",
    roadmap_90: "Scale profitable channels with standardized conversion playbooks.",
    content_format_channel_snapshot:
      "Blend social proof reels, creator stories, and comparison-focused PDP modules.",
    marketing_spend_audit_signal:
      "Reallocate spend from broad reach to high-intent retargeting and trust-led conversion assets.",
    competitive_vulnerability_signal:
      "Competitors that surface social proof earlier will continue to win checkout confidence.",
    revenue_impact_statement:
      "Reducing checkout friction and improving trust visibility can materially improve ROAS and margin.",
    brand_opportunities:
      "Unify brand expression with conversion architecture so creative strength also drives revenue efficiency.",
    full_report: {},
    user_email: "sample@wunderbar.ai",
  },
};

export default async function SnapshotPlusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: reportId } = await params;

  if (!reportId) {
    return (
      <div className="p-10 text-red-600 text-center">
        Missing report ID.
      </div>
    );
  }

  // Serve known sample routes without external dependencies.
  const sampleReport = SAMPLE_SNAPSHOT_PLUS_REPORTS[reportId];
  let report: any = null;
  let error: any = null;

  if (!sampleReport) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const queryResult = await supabase
        .from("brand_snapshot_plus_reports")
        .select("*")
        .eq("report_id", reportId)
        .single();
      report = queryResult.data;
      error = queryResult.error;
    }
  }

  const resolvedReport = sampleReport || report;

  if (!resolvedReport) {
    console.error("Error fetching report:", error);
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-semibold mb-2">Report Not Found</h1>
        <p className="text-slate-600">
          This WunderBrand Snapshot+™ report does not exist or is no longer available.
        </p>
      </div>
    );
  }

  const {
    business_name,
    industry,
    brand_alignment_score,
    pillar_scores,
    pillar_insights,
    enriched_persona,
    enriched_archetype,
    enriched_voice,
    enriched_color_palette,
    opportunities_map,
    roadmap_30,
    roadmap_60,
    roadmap_90,
    content_format_channel_snapshot,
    marketing_spend_audit_signal,
    competitive_vulnerability_signal,
    revenue_impact_statement,
    brand_opportunities,
    full_report,
  } = resolvedReport;
  const reportEmail =
    typeof (resolvedReport as any).user_email === "string" ? (resolvedReport as any).user_email : undefined;
  const workbookHref = reportEmail
    ? `/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(reportEmail)}`
    : `/workbook?reportId=${encodeURIComponent(reportId)}`;
  const derivedCompetitiveVulnerabilitySignal =
    competitive_vulnerability_signal ||
    full_report?.competitiveVulnerabilitySignal ||
    null;
  const derivedMarketingSpendSignal =
    marketing_spend_audit_signal ||
    full_report?.marketingSpendEfficiencySignal ||
    null;
  const derivedRevenueImpactStatement =
    revenue_impact_statement ||
    full_report?.revenueImpactStatement ||
    null;
  const navItems = [
    { id: "summary", label: "Summary" },
    { id: "score", label: "Score" },
    { id: "pillars", label: "Pillars" },
    { id: "signals", label: "Signals" },
    { id: "archetype", label: "Archetype" },
    { id: "roadmap", label: "Roadmap" },
    { id: "next-steps", label: "Next Steps" },
  ];
  const weakestPillarKey =
    Object.entries(pillar_scores || {})
      .filter((entry): entry is [string, number] => typeof entry[1] === "number")
      .sort((a, b) => a[1] - b[1])[0]?.[0] || "positioning";
  const weakestPillarLabel =
    weakestPillarKey.charAt(0).toUpperCase() + weakestPillarKey.slice(1);

  const css = `
    body { font-family: Helvetica Neue, sans-serif; color:#0C1526; }
    .page { max-width:900px; margin:0 auto; padding:32px 16px; }
    h1,h2,h3 { color:#021859; word-break:break-word; }
    h1 { font-size:clamp(24px, 5vw, 40px); font-weight:700; margin-bottom:16px; }
    h2 { font-size:clamp(18px, 4vw, 24px); font-weight:600; margin-top:36px; margin-bottom:12px; }
    h3 { font-size:clamp(16px, 3.5vw, 20px); font-weight:600; margin-top:24px; margin-bottom:8px; }

    .section {
      padding:20px;
      border-radius:12px;
      border:1px solid #E0E3EA;
      background:#FFFFFF;
      margin-top:24px;
      box-shadow:0 8px 24px rgba(2,24,89,0.06);
      opacity:0;
      animation:fadeIn 0.7s forwards ease;
    }

    .score { font-size:clamp(40px, 10vw, 72px); font-weight:700; color:#021859; }

    .meter-track {
      width:100%; height:12px; background:#E0E3EA; border-radius:6px; margin-top:12px;
    }
    .meter-fill { height:12px; background:#07B0F2; width:0%; animation:grow 1.2s ease forwards; }

    .pillars { margin-top:20px; display:grid; gap:16px; }

    .pillar-card {
      border:1px solid #E0E3EA;
      border-radius:10px;
      padding:16px 18px;
      background:#FAFBFF;
      opacity:0;
      animation:fadeInUp 0.6s forwards ease;
    }

    .color-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
    .swatch {
      width:44px; height:44px; border-radius:6px; border:1px solid #DDE2EA; margin-right:8px;
    }

    .op-map, .roadmap { margin-top:16px; }

    .blueprint-cta {
      margin-top:36px; padding:28px 20px; border-radius:12px;
      background:#021859; color:white; text-align:center;
      opacity:0; animation:fadeIn 1s forwards ease;
    }

    .blueprint-btn {
      display:inline-block; margin-top:18px; padding:14px 26px; background:#07B0F2;
      border-radius:6px; font-weight:600; text-decoration:none; color:#FFFFFF;
      box-shadow:0 6px 18px rgba(7,176,242,0.3);
    }

    .action-bar {
      position: sticky;
      top: 84px;
      z-index: 60;
      margin-top: 18px;
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
    .action-brand-note strong { color: #07B0F2; }
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

    @media (min-width: 640px) {
      .page { padding:48px 24px; }
      .section { padding:28px; margin-top:28px; }
      .pillar-card { padding:20px 24px; }
      .blueprint-cta { padding:40px; }
      .swatch { width:52px; height:52px; }
      .action-btn { font-size: 13px; }
      .jump-links a { font-size: 12px; }
    }

    @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
    @keyframes fadeInUp { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
    @keyframes grow { from{width:0%;} to{width:100%;} }
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

  return (
    <div className="page">
      <style>{css}</style>

      <BlueprintPlusHeader
        productName="WunderBrand Snapshot+™"
        reportId={reportId}
        userEmail={reportEmail}
        pdfHref={`/api/pdf?id=${encodeURIComponent(reportId)}&type=snapshot-plus`}
        utmMedium="snapshot_plus_results"
        navItems={navItems}
      />

      <div id="summary" className="section">
        <h2>Executive Summary</h2>
        <p style={{ lineHeight: "1.65" }}>
          This high-level overview summarizes your current WunderBrand Score™, pillar performance,
          and the strongest near-term improvement priority in <strong>{weakestPillarLabel}</strong>.
        </p>
        {opportunities_map && (
          <p style={{ lineHeight: "1.65", marginTop: "10px" }}>
            {typeof opportunities_map === "string"
              ? opportunities_map
              : JSON.stringify(opportunities_map)}
          </p>
        )}
      </div>

      {/* SCORE SECTION */}
      <div id="score" className="section">
        <h2>Your WunderBrand Score™</h2>
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <ScoreGauge value={brand_alignment_score || 0} showLegend />
        </div>
      </div>

      {/* PILLARS */}
      <div id="pillars" className="section">
        <h2>Pillar Analysis</h2>
        <div className="pillars">
          {Object.entries(pillar_scores || {}).map(([pillar, score]: [string, any], idx) => {
            const insight = pillar_insights?.[pillar];
            const insightText = getInsightText(insight);
            
            return (
              <div className="pillar-card" key={pillar} style={{ animationDelay: `${idx * 0.12}s` }}>
                <h3>{pillar.charAt(0).toUpperCase() + pillar.slice(1)}</h3>

                <div className="meter-track" style={{ marginBottom: "10px" }}>
                  <div
                    className="meter-fill"
                    style={{ width: `${(score / 20) * 100}%` }}
                  />
                </div>

                <p style={{ lineHeight: "1.55" }}>{insightText}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* STRATEGY SNAPSHOT SIGNALS */}
      <div id="signals" className="section">
        <h2>Content Format &amp; Channel Snapshot</h2>
        <p style={{ lineHeight: "1.65" }}>
          {content_format_channel_snapshot ||
            "This section maps your audience to the most effective content formats, highest-leverage channels, and funnel-stage priorities so execution starts with the right sequence."}
        </p>
      </div>

      <div className="section">
        <h2>Marketing Spend Efficiency Signal</h2>
        <p style={{ lineHeight: "1.65" }}>
          {derivedMarketingSpendSignal ||
            "This section highlights whether current spend allocation aligns with audience behavior and where budget efficiency can improve before scaling channel complexity."}
        </p>
      </div>

      <div className="section">
        <h2>Competitive Vulnerability Signal</h2>
        <p style={{ lineHeight: "1.65" }}>
          {derivedCompetitiveVulnerabilitySignal ||
            "This section identifies where competitors are most likely to out-position your brand and what to address first to reduce exposure."}
        </p>
      </div>

      <div className="section">
        <h2>Revenue Impact Statement</h2>
        <p style={{ lineHeight: "1.65" }}>
          {derivedRevenueImpactStatement ||
            "This section frames the likely business impact of your current gaps and where targeted improvements can increase commercial performance."}
        </p>
      </div>

      {brand_opportunities && (
        <div className="section">
          <h2>Core Brand Opportunities</h2>
          <p style={{ lineHeight: "1.65" }}>
            {typeof brand_opportunities === "string"
              ? brand_opportunities
              : JSON.stringify(brand_opportunities)}
          </p>
        </div>
      )}

      {/* BRAND PERSONA */}
      {enriched_persona && (
        <div className="section">
          <h2>Brand Persona</h2>
          <p style={{ lineHeight: "1.65" }}>
            {typeof enriched_persona === 'string' 
              ? enriched_persona 
              : enriched_persona.description || enriched_persona}
          </p>
        </div>
      )}

      {/* ARCHETYPE */}
      {enriched_archetype && (
        <div id="archetype" className="section">
          <h2>Brand Archetype</h2>
          {typeof enriched_archetype === 'string' ? (
            <p style={{ lineHeight: "1.65" }}>{enriched_archetype}</p>
          ) : (
            <>
              <h3>{enriched_archetype.name || 'Brand Archetype'}</h3>
              <p style={{ lineHeight: "1.65" }}>{enriched_archetype.summary || enriched_archetype.description}</p>
            </>
          )}
        </div>
      )}

      {/* BRAND VOICE */}
      {enriched_voice && (
        <div className="section">
          <h2>Brand Voice Guidance</h2>
          {typeof enriched_voice === 'string' ? (
            <p style={{ lineHeight: "1.65" }}>{enriched_voice}</p>
          ) : (
            <>
              <p style={{ lineHeight: "1.65" }}>{enriched_voice.summary || enriched_voice.description}</p>
              {enriched_voice.pillars && Array.isArray(enriched_voice.pillars) && enriched_voice.pillars.length > 0 && (
                <>
                  <h3 style={{ marginTop: "20px" }}>Tone Pillars</h3>
                  <ul style={{ marginTop: "12px", paddingLeft: "20px" }}>
                    {enriched_voice.pillars.map((p: string, i: number) => (
                      <li key={i} style={{ marginBottom: "4px" }}>{p}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* COLOR PALETTE */}
      {enriched_color_palette && Array.isArray(enriched_color_palette) && enriched_color_palette.length > 0 && (
        <div className="section">
          <h2>Recommended Color Palette</h2>
          <div className="color-grid">
            {enriched_color_palette.map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div className="swatch" style={{ background: item.hex || '#000000' }} />
                <div>
                  <div style={{ fontSize: "15px" }}>{item.name || 'Color'}</div>
                  <div style={{ fontSize: "13px", color: "#525D72" }}>{item.role || 'Primary'}</div>
                  <div style={{ fontSize: "13px", marginTop: "6px" }}>{item.meaning || 'No meaning specified'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPPORTUNITIES MAP */}
      {opportunities_map && (
        <div className="section">
          <h2>Brand Opportunities Map</h2>
          <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
            {typeof opportunities_map === 'string' 
              ? opportunities_map 
              : JSON.stringify(opportunities_map)}
          </p>
        </div>
      )}

      {/* ROADMAP */}
      {(roadmap_30 || roadmap_60 || roadmap_90) && (
        <div id="roadmap" className="section roadmap">
          <h2>Recommended 30/60/90-Day Roadmap</h2>

          {roadmap_30 && (
            <>
              <h3>Next 30 Days</h3>
              <p>{typeof roadmap_30 === 'string' ? roadmap_30 : JSON.stringify(roadmap_30)}</p>
            </>
          )}

          {roadmap_60 && (
            <>
              <h3>Next 60 Days</h3>
              <p>{typeof roadmap_60 === 'string' ? roadmap_60 : JSON.stringify(roadmap_60)}</p>
            </>
          )}

          {roadmap_90 && (
            <>
              <h3>Next 90 Days</h3>
              <p>{typeof roadmap_90 === 'string' ? roadmap_90 : JSON.stringify(roadmap_90)}</p>
            </>
          )}
        </div>
      )}

      {/* VOC Survey — Customer Perception Insights */}
      <VocSurveyCTA reportId={reportId} businessName={business_name || "Your Business"} />

      {/* PDF DOWNLOAD + SHARE */}
      <div id="next-steps" style={{ marginTop: "32px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
        <a
          href={`/api/pdf?id=${reportId}&type=snapshot-plus`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            borderRadius: "8px",
            background: "#07B0F2",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(7,176,242,0.25)",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Snapshot+\u2122 PDF
        </a>
        <ShareButton
          reportId={reportId}
          tier="snapshot-plus"
          label="Snapshot+ Report"
          variant="text"
        />
      </div>

      {/* CTA: Upgrade to Blueprint (after users consume report and next-step actions) */}
      <div className="blueprint-cta">
        <h2>Ready for Blueprint™?</h2>
        <p style={{ maxWidth: "620px", margin: "0 auto", lineHeight: "1.6" }}>
          Blueprint™ turns these findings into a complete brand foundation:
          messaging system, positioning architecture, visual direction, and implementation roadmap.
        </p>
        <Link href="/upgrade/blueprint" className="blueprint-btn">
          Explore WunderBrand Blueprint™ →
        </Link>
      </div>
    </div>
  );
}

