// app/report/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      const { data, error } = await supabase
        .from("brand_snapshot_reports")
        .select("*")
        .eq("report_id", reportId)
        .single();

      if (error) {
        setError("We couldn't load your Brand Snapshot™.");
      } else {
        setReport(data);
      }
      setLoading(false);
    }
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <main className="p-10 text-center text-brand-navy">
        <p>Loading your Brand Snapshot™…</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="p-10 text-center text-brand-navy">
        <p>Sorry — we couldn't find this report.</p>
      </main>
    );
  }

  const {
    user_name,
    brand_alignment_score,
    pillar_scores,
    pillar_insights,
    pdf_url,
  } = report;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10 bg-white text-brand-navy">

      {/* ============================
          INLINE CSS FOR DEAL.AI
      ============================ */}
      <style>{`
        :root {
          --navy: #021859;
          --blue: #07B0F2;
          --aqua: #27CDF2;
          --midnight: #0C1526;
          --gray: #F2F2F2;
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(10px); }
        }

        .score-card {
          border: 1px solid #E0E3EA;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 10px 26px rgba(7,176,242,0.15);
          background: #ffffff;
        }

        .meter-track {
          width: 100%;
          height: 14px;
          border-radius: 999px;
          background: #E5E7EB;
          overflow: hidden;
        }

        .meter-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #f97373, #facc15, #22c55e);
        }

        .pillar-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .tag {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }

        .tag-strong { background: #dcfce7; color: #166534; }
        .tag-steady { background: #fef9c3; color: #854d0e; }
        .tag-mixed  { background: #fef3c7; color: #92400e; }
        .tag-focus  { background: #fee2e2; color: #b91c1c; }

        .cta-panel {
          border-radius: 18px;
          padding: 32px;
          text-align: center;
          background: #e5f6ff;
          box-shadow: 0 10px 26px rgba(7,176,242,0.25);
        }

        .cta-button {
          display: inline-block;
          margin-top: 16px;
          padding: 14px 28px;
          background: var(--blue);
          color: #ffffff;
          font-weight: 600;
          border-radius: 5px;
          text-decoration: none;
          box-shadow: 0 8px 22px rgba(7,176,242,0.35);
        }
        .cta-button:hover {
          background: #059BD8;
        }
      `}</style>

      {/* ============================
          HEADER
      ============================ */}
      <h1 className="text-3xl font-semibold mb-2 fade-in">
        Your Brand Snapshot™ Results
      </h1>
      <p className="text-lg text-slate-600 mb-10 fade-in">
        Here's your personalized Brand Alignment Score™ and insights, {user_name}.
      </p>

      {/* ============================
          SCORE CARD
      ============================ */}
      <section className="score-card w-full max-w-3xl fade-in mb-10">
        <h2 className="text-xl font-semibold mb-4">Brand Alignment Score™</h2>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-5xl font-bold">{brand_alignment_score}</span>
          <span className="text-slate-600 text-sm">out of 100</span>
        </div>

        <div className="meter-track mb-4">
          <div
            className="meter-fill"
            style={{ width: `${brand_alignment_score}%` }}
          ></div>
        </div>

        {/* Pillars */}
        <h3 className="text-lg font-semibold mt-6 mb-3">How your score breaks down</h3>

        {Object.entries(pillar_scores || {}).map(([pillar, score]: [string, any]) => {
          const percent = (score / 20) * 100;

          let tagClass = "tag-focus";
          if (score >= 18) tagClass = "tag-strong";
          else if (score >= 15) tagClass = "tag-steady";
          else if (score >= 11) tagClass = "tag-mixed";

          // Handle both old format (string) and new format (object)
          const insightData = pillar_insights?.[pillar];
          const insight = typeof insightData === 'string' 
            ? insightData 
            : insightData?.opportunity || insightData?.strength || "No insight available.";

          return (
            <div key={pillar} className="pillar-row">
              <div className="w-40">
                <strong className="capitalize">{pillar}</strong><br />
                <span className={`tag ${tagClass}`}>{score}/20</span>
              </div>
              <div className="flex-1 meter-track">
                <div className="meter-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}

        {/* Insights */}
        <h3 className="text-lg font-semibold mt-8 mb-3">Key Insights</h3>
        <div className="space-y-3">
          {pillar_insights &&
            Object.entries(pillar_insights).map(([pillar, insight]: [string, any]) => {
              // Handle both old format (string) and new format (object)
              const insightText = typeof insight === 'string' 
                ? insight 
                : insight?.opportunity || insight?.strength || "No insight available.";

              return (
                <p key={pillar} className="text-slate-700 leading-relaxed">
                  <strong className="capitalize">{pillar}:</strong> {insightText}
                </p>
              );
            })}
        </div>
      </section>

      {/* ============================
          DOWNLOAD PDF BUTTON
      ============================ */}
      {pdf_url && (
        <a
          href={pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button fade-in mb-10"
        >
          Download Full Brand Snapshot™ PDF →
        </a>
      )}

      {/* ============================
          SNAPSHOT+ UPGRADE PANEL
      ============================ */}
      <section className="cta-panel w-full max-w-3xl fade-in">
        <h2 className="text-2xl font-semibold mb-3">
          Want deeper insights + your full brand foundation?
        </h2>

        <p className="text-slate-700 leading-relaxed mb-6">
          Upgrade to <strong>Brand Snapshot+™</strong> for your complete 10-page brand
          analysis — including your Brand Archetype™, Brand Persona™, tone and messaging
          guidance, visual direction, strategic priorities, and a 90-day roadmap.
        </p>

        <a href="/plans" className="cta-button">
          Upgrade to Snapshot+™ →
        </a>
      </section>

      {/* ============================
          FOOTER
      ============================ */}
      <footer className="mt-16 text-slate-500 text-sm fade-in">
        © 2025 Wunderbar Digital. All rights reserved.
      </footer>

    </main>
  );
}
