"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import "@/app/report/report.css"; // animations + styling overrides

export default function BrandSnapshotReport({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("brand_snapshot_reports")
        .select("*")
        .eq("report_id", params.id)
        .single();

      if (!error && data) setReport(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center text-brand-navy text-lg">
        Loading your report…
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center text-brand-navy text-lg">
        Report not found.
      </div>
    );
  }

  // Extract data from full_report JSONB field or fallback to direct fields
  const fullReport = report.full_report || report;
  const {
    brand_alignment_score = report.brand_alignment_score || 0,
    pillar_scores = report.pillar_scores || {},
    pillar_insights = report.pillar_insights || {},
    recommendations = report.recommendations || {},
    persona = report.persona || null,
    archetype = report.archetype || null,
    brand_pillars = report.brand_pillars || null,
    color_palette = report.color_palette || null,
  } = fullReport;

  return (
    <main className="min-h-screen bg-white text-brand-midnight pb-32">
      {/* ==============================
          HEADER / HERO 
      =============================== */}
      <section className="max-w-4xl mx-auto px-6 pt-20 fade-in">
        <h1 className="text-4xl font-semibold text-brand-navy">
          Your Brand Snapshot™ Results
        </h1>
        <p className="text-lg text-brand-midnight mt-3 max-w-2xl leading-relaxed">
          Based on your inputs, WUNDY™ analyzed your positioning, messaging,
          visibility, credibility, and conversion foundation. This report
          summarizes where your brand is strong — and where small refinements
          could create meaningful momentum.
        </p>
      </section>

      {/* ==============================
          SCORE CARD 
      =============================== */}
      <section className="max-w-4xl mx-auto mt-10 px-6 fade-in-up">
        <div className="rounded-2xl border border-brand-border shadow-lg p-8 bg-white">
          <h2 className="text-xl font-semibold text-brand-navy">Brand Alignment Score™</h2>
          <div className="flex items-center gap-6 mt-6">
            <div className="text-6xl font-bold text-brand-navy">
              {brand_alignment_score}
            </div>
            <div className="flex-1">
              <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-blue transition-all duration-500"
                  style={{ width: `${brand_alignment_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Higher scores indicate stronger clarity, trust, and conversion potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================
          PILLAR BREAKDOWN
      =============================== */}
      <section className="max-w-4xl mx-auto mt-16 px-6 fade-in-up">
        <h2 className="text-2xl font-semibold text-brand-navy">Your Five Pillars</h2>
        <p className="text-base mt-2 text-slate-700">
          Each pillar influences how confidently your brand shows up in the market.
        </p>
        <div className="mt-8 space-y-8">
          {Object.entries(pillar_scores).map(([pillar, score]: [string, any]) => {
            // Handle both old format (string) and new format (object with strength, opportunity, action)
            const insightData = pillar_insights[pillar];
            const insight = typeof insightData === 'string' 
              ? insightData 
              : insightData?.opportunity || insightData?.strength || "No insight available.";
            
            const recommendationData = recommendations[pillar];
            const recommendation = typeof recommendationData === 'string'
              ? recommendationData
              : recommendationData || "No recommendation available.";

            const percent = (score / 20) * 100;

            return (
              <div key={pillar} className="border border-brand-border rounded-xl p-6 bg-white fade-in-up">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold text-brand-navy capitalize">
                    {pillar}
                  </h3>
                  <span className="font-bold text-brand-blue">
                    {score}/20
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full mt-4">
                  <div
                    className="h-full rounded-full bg-brand-blue transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-slate-700">{insight}</p>
                <div className="mt-4 bg-brand-gray rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-brand-navy">
                    Recommendation
                  </h4>
                  <p className="text-sm text-slate-700 mt-1">{recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==============================
          BRAND PERSONA & ARCHETYPE
      =============================== */}
      {(persona || archetype) && (
        <section className="max-w-4xl mx-auto mt-20 px-6 fade-in-up">
          <h2 className="text-2xl font-semibold text-brand-navy">Brand Persona & Archetype</h2>
          <p className="text-base text-slate-700 mt-2">
            These shape your tone, visual direction, and how customers emotionally connect with your brand.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {persona && (
              <div className="border border-brand-border p-6 rounded-xl bg-white">
                <h3 className="text-lg font-semibold text-brand-navy">Persona</h3>
                <p className="text-slate-700 mt-2">{persona}</p>
              </div>
            )}
            {archetype && (
              <div className="border border-brand-border p-6 rounded-xl bg-white">
                <h3 className="text-lg font-semibold text-brand-navy">Archetype</h3>
                <p className="text-slate-700 mt-2">{archetype}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==============================
          BRAND PILLARS (from Snapshot+)
      =============================== */}
      {brand_pillars && Array.isArray(brand_pillars) && brand_pillars.length > 0 && (
        <section className="max-w-4xl mx-auto mt-20 px-6 fade-in-up">
          <h2 className="text-2xl font-semibold text-brand-navy">Brand Pillars</h2>
          <p className="text-base text-slate-700 mt-2">
            These define your strategic foundation — the core truths your brand stands on.
          </p>
          <ul className="mt-6 space-y-3">
            {brand_pillars.map((p: string, i: number) => (
              <li
                key={i}
                className="p-4 border border-brand-border rounded-lg bg-white text-slate-700"
              >
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ==============================
          COLOR PALETTE WITH MEANING
      =============================== */}
      {color_palette && Array.isArray(color_palette) && color_palette.length > 0 && (
        <section className="max-w-4xl mx-auto mt-20 px-6 fade-in-up">
          <h2 className="text-2xl font-semibold text-brand-navy">Recommended Color Palette</h2>
          <p className="mt-2 text-base text-slate-700">
            Based on your persona and archetype, WUNDY™ recommends this palette for clarity,
            emotional resonance, and consistent visual identity.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {color_palette.map((c: any, i: number) => (
              <div
                key={i}
                className="border border-brand-border p-6 rounded-xl bg-white fade-in-up"
              >
                <div
                  className="w-full h-14 rounded-md border border-brand-border"
                  style={{ backgroundColor: c.hex }}
                ></div>
                <p className="mt-3 font-semibold text-brand-navy">{c.name}</p>
                <p className="text-sm text-slate-700">{c.hex}</p>
                <p className="mt-2 text-sm text-brand-midnight">
                  <strong>Role:</strong> {c.role}
                </p>
                <p className="mt-1 text-sm text-brand-midnight">
                  <strong>Meaning:</strong> {c.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==============================
          SNAPSHOT+™ UPGRADE PANEL
      =============================== */}
      <section className="max-w-4xl mx-auto mt-24 px-6 fade-in-up">
        <div className="border border-brand-blue rounded-2xl p-10 bg-brand-blue/5 shadow-md text-center">
          <h2 className="text-2xl font-semibold text-brand-navy">
            Want the full strategic treatment?
          </h2>
          <p className="text-base text-slate-700 mt-3 max-w-2xl mx-auto">
            Upgrade to <strong>Brand Snapshot+™</strong> and receive a fully built brand
            platform including brand pillars, persona, archetype, color palette,
            messaging frameworks, and actionable strategic recommendations.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_SNAPSHOT_PLUS_URL || "/purchase/snapshot-plus"}
            className="inline-block px-8 py-4 mt-6 rounded-md bg-brand-blue text-white font-semibold shadow-lg hover:bg-brand-blueHover transition"
          >
            Upgrade to Brand Snapshot+™ →
          </a>
        </div>
      </section>
    </main>
  );
}
