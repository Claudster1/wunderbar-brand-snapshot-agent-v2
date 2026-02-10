// app/snapshot-plus/[id]/page.tsx

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { VocSurveyCTA } from "@/components/voc/VocSurveyCTA";

export const dynamic = "force-dynamic";

export default async function SnapshotPlusPage({ params }: { params: Promise<{ id: string }> }) {
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
    .from("brand_snapshot_plus_reports")
    .select("*")
    .eq("report_id", reportId)
    .single();

  if (error || !report) {
    console.error("Error fetching report:", error);
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-semibold mb-2">Report Not Found</h1>
        <p className="text-slate-600">
          This Brand Snapshot+™ report does not exist or is no longer available.
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
  } = report;

  const css = `
    body { font-family: Helvetica Neue, sans-serif; color:#0C1526; }
    .page { max-width:900px; margin:0 auto; padding:48px 20px; }
    h1,h2,h3 { color:#021859; }
    h1 { font-size:40px; font-weight:700; margin-bottom:16px; }
    h2 { font-size:24px; font-weight:600; margin-top:48px; margin-bottom:12px; }
    h3 { font-size:20px; font-weight:600; margin-top:32px; margin-bottom:8px; }

    .section {
      padding:28px;
      border-radius:12px;
      border:1px solid #E0E3EA;
      background:#FFFFFF;
      margin-top:28px;
      box-shadow:0 8px 24px rgba(2,24,89,0.06);
      opacity:0;
      animation:fadeIn 0.7s forwards ease;
    }

    .score { font-size:72px; font-weight:700; color:#021859; }

    .meter-track {
      width:100%; height:12px; background:#E0E3EA; border-radius:6px; margin-top:12px;
    }
    .meter-fill { height:12px; background:#07B0F2; width:0%; animation:grow 1.2s ease forwards; }

    .pillars { margin-top:20px; display:grid; gap:20px; }

    .pillar-card {
      border:1px solid #E0E3EA;
      border-radius:10px;
      padding:20px 24px;
      background:#FAFBFF;
      opacity:0;
      animation:fadeInUp 0.6s forwards ease;
    }

    .color-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px; }
    .swatch {
      width:52px; height:52px; border-radius:6px; border:1px solid #DDE2EA; margin-right:12px;
    }

    .op-map, .roadmap { margin-top:16px; }

    .blueprint-cta {
      margin-top:48px; padding:40px; border-radius:12px;
      background:#021859; color:white; text-align:center;
      opacity:0; animation:fadeIn 1s forwards ease;
    }

    .blueprint-btn {
      display:inline-block; margin-top:18px; padding:14px 26px; background:#07B0F2;
      border-radius:6px; font-weight:600; text-decoration:none; color:#FFFFFF;
      box-shadow:0 6px 18px rgba(7,176,242,0.3);
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

      {/* HEADER */}
      <h1>Snapshot+™ Brand Intelligence Report</h1>
      <p style={{ maxWidth: "720px", lineHeight: "1.6" }}>
        This expanded analysis builds on your Brand Snapshot™ results and adds deeper strategic
        insight across brand clarity, voice, visuals, audience, archetype, and next-step priorities.
      </p>

      {/* SCORE SECTION */}
      <div className="section">
        <h2>Your Brand Alignment Score™</h2>
        <div className="score">{brand_alignment_score || 0}</div>

        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${brand_alignment_score || 0}%` }}
          ></div>
        </div>
      </div>

      {/* PILLARS */}
      <div className="section">
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
        <div className="section">
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
        <div className="section roadmap">
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

      {/* CTA: Upgrade to Blueprint */}
      <div className="blueprint-cta">
        <h2>Ready for Blueprint™?</h2>
        <p style={{ maxWidth: "620px", margin: "0 auto", lineHeight: "1.6" }}>
          Blueprint™ is where your strategy becomes a complete brand foundation —
          messaging, identity, audience segmentation, competitor positioning,
          visual system direction, and a full marketing roadmap.
        </p>

        <Link href="/upgrade/blueprint" className="blueprint-btn">
          Explore Brand Blueprint™ →
        </Link>
      </div>

      {/* PDF DOWNLOAD */}
      <p style={{ marginTop: "32px" }}>
        <a
          href={`/api/report/pdf?id=${reportId}&plus=1`}
          style={{ textDecoration: "underline", color: "#021859" }}
        >
          Download Snapshot+™ PDF →
        </a>
      </p>
    </div>
  );
}

