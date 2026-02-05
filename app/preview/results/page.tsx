// app/preview/results/page.tsx
// Brand Snapshot™ (Free) - Preview with new report structure

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ScoreGauge } from "@/src/components/ScoreGauge";

// Mock data matching the new report structure
const MOCK_REPORT = {
  businessName: "Acme Co",
  executiveSummary: {
    brandAlignmentScore: 72,
    diagnosis: "Your brand is currently strong but inconsistent because your positioning is clear internally but not consistently reflected across customer touchpoints.",
    primaryOpportunity: "Aligning your external messaging with your internal clarity will immediately strengthen trust and conversion.",
    primaryRisk: "Without addressing visibility gaps, competitors with weaker offerings but stronger presence will continue to capture attention you deserve.",
  },
  brandAlignmentOverview: {
    positioning: "Clear differentiation exists but is not consistently communicated across channels.",
    messaging: "Core message is solid; supporting proof points are underdeveloped.",
    visibility: "Present on key channels but content lacks strategic cohesion.",
    credibility: "Strong foundation of trust signals; visibility of proof could improve.",
    conversion: "Functional conversion paths exist; optimization opportunities remain.",
  },
  pillarScores: {
    positioning: {
      score: 16,
      whatsWorking: "Clear understanding of target audience and competitive differentiation.",
      whatsUnclear: "Positioning statement is not consistently reflected in website copy and social presence.",
      whyItMatters: "Inconsistent positioning creates confusion and weakens the brand's ability to command premium pricing.",
    },
    messaging: {
      score: 15,
      whatsWorking: "Core value proposition is compelling and benefit-focused.",
      whatsUnclear: "Supporting messages lack specific proof points and customer outcomes.",
      whyItMatters: "Without proof, messaging feels like claims rather than facts, reducing trust.",
    },
    visibility: {
      score: 14,
      whatsWorking: "Active presence across multiple relevant channels.",
      whatsUnclear: "Content strategy appears reactive rather than strategically planned.",
      whyItMatters: "Scattered visibility efforts dilute impact and waste resources on low-return activities.",
    },
    credibility: {
      score: 13,
      whatsWorking: "Testimonials and case studies exist and are genuine.",
      whatsUnclear: "Social proof is buried or hard to find at key decision points.",
      whyItMatters: "Hidden credibility signals force prospects to work harder to trust you, increasing drop-off.",
    },
    conversion: {
      score: 14,
      whatsWorking: "Clear calls-to-action and defined conversion paths.",
      whatsUnclear: "Lead nurturing and follow-up sequences are underdeveloped.",
      whyItMatters: "Without nurturing, warm leads go cold and acquisition costs rise.",
    },
  },
  brandArchetype: {
    name: "The Sage",
    alignedSignal: "When aligned, The Sage signals expertise, trustworthiness, and the ability to guide others toward better decisions.",
    misusedRisk: "If overused, The Sage can come across as condescending or overly academic, alienating audiences who want practical help.",
  },
  immediateActions: [
    {
      action: "Audit your homepage and ensure your positioning statement appears within the first screen fold.",
      pillar: "Positioning",
    },
    {
      action: "Add one customer testimonial or case study to your homepage above the fold.",
      pillar: "Credibility",
    },
    {
      action: "Review your last 10 social posts and identify which pillar each supports — if scattered, pick one pillar to focus on for 30 days.",
      pillar: "Visibility",
    },
  ],
  whatsNext: "This diagnostic reveals where your brand stands today. Brand Snapshot+ provides the deeper strategic insight needed to understand why these patterns exist and what to prioritize first — including audience clarity, archetype guidance, visual direction, and a prioritized action plan.",
};

const PILLAR_LABELS: Record<string, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

export default function PreviewResultsPage() {
  const report = MOCK_REPORT;

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Preview Banner */}
        <div className="bs-card rounded-xl bg-[#fff9e6] border-2 border-[#f5e6b3] px-5 py-4 bs-body-sm text-[#8b6914] flex flex-wrap items-center gap-2">
          <span>
            <strong>Preview mode</strong> — Mock data showing new report structure.
          </span>
          <Link href="/preview" className="text-brand-navy font-semibold underline hover:no-underline">
            ← All previews
          </Link>
        </div>

        {/* Header */}
        <header>
          <p className="bs-eyebrow text-brand-blue uppercase tracking-widest text-xs font-black mb-2">Brand Snapshot™</p>
          <h1 className="bs-h1 mb-1">{report.businessName}</h1>
          <p className="bs-body-sm text-brand-muted">Brand Alignment Diagnostic</p>
        </header>

        {/* 1. Executive Summary */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Executive Summary</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Score Gauge */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={report.executiveSummary.brandAlignmentScore} size={160} />
              <p className="bs-h3 mt-2">{report.executiveSummary.brandAlignmentScore}/100</p>
              <p className="bs-small text-brand-muted">Brand Alignment Score</p>
            </div>

            {/* Diagnosis */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Diagnosis</p>
                <p className="bs-body text-brand-midnight">{report.executiveSummary.diagnosis}</p>
              </div>
              <div>
                <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Primary Opportunity</p>
                <p className="bs-body text-brand-midnight">{report.executiveSummary.primaryOpportunity}</p>
              </div>
              <div>
                <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Risk if Unchanged</p>
                <p className="bs-body text-brand-midnight">{report.executiveSummary.primaryRisk}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Brand Alignment Overview */}
        <section>
          <h2 className="bs-h2 mb-4">Brand Alignment Overview</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Current state across the five pillars of brand alignment.</p>
          
          <div className="grid gap-3">
            {(["positioning", "messaging", "visibility", "credibility", "conversion"] as const).map((pillar) => (
              <div key={pillar} className="bs-card rounded-lg p-4 border border-brand-navy/10 flex items-start gap-3">
                <span className="bs-small font-bold text-brand-navy min-w-[100px]">{PILLAR_LABELS[pillar]}</span>
                <p className="bs-body-sm text-brand-midnight">{report.brandAlignmentOverview[pillar]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Pillar Scores */}
        <section>
          <h2 className="bs-h2 mb-4">Pillar Scores</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Detailed breakdown of each pillar.</p>
          
          <div className="space-y-4">
            {(["positioning", "messaging", "visibility", "credibility", "conversion"] as const).map((pillar) => {
              const data = report.pillarScores[pillar];
              const scorePercent = (data.score / 20) * 100;
              return (
                <div key={pillar} className="bs-card rounded-xl p-5 md:p-6 border border-brand-navy/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="bs-h3">{PILLAR_LABELS[pillar]}</h3>
                    <span className="bs-h3 text-brand-blue">{data.score}/20</span>
                  </div>
                  
                  {/* Score bar with red-to-green gradient */}
                  <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${scorePercent}%`,
                        background: `linear-gradient(90deg, #ff3b30 0%, #ff9500 25%, #ffcc00 50%, #8bc34a 75%, #34c759 100%)`,
                        backgroundSize: `${100 / (scorePercent / 100)}% 100%`,
                      }}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">What's Working</p>
                      <p className="bs-body-sm text-brand-midnight">{data.whatsWorking}</p>
                    </div>
                    <div>
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">What's Unclear</p>
                      <p className="bs-body-sm text-brand-midnight">{data.whatsUnclear}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-brand-navy/5">
                    <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Why This Matters</p>
                    <p className="bs-body-sm text-brand-midnight">{data.whyItMatters}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Brand Archetype */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10 bg-brand-navy/[0.02]">
          <h2 className="bs-h2 mb-4">Brand Archetype</h2>
          
          <div className="space-y-4">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Primary Archetype</p>
              <p className="bs-h3 text-brand-navy">{report.brandArchetype.name}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">When Aligned</p>
              <p className="bs-body text-brand-midnight">{report.brandArchetype.alignedSignal}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Risk if Misused</p>
              <p className="bs-body text-brand-midnight">{report.brandArchetype.misusedRisk}</p>
            </div>
          </div>
        </section>

        {/* 5. Immediate Clarity Actions */}
        <section>
          <h2 className="bs-h2 mb-2">Immediate Clarity Actions</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Three specific actions to take in the next 7–14 days.</p>
          
          <div className="space-y-4">
            {report.immediateActions.map((item, idx) => (
              <div key={idx} className="bs-card rounded-xl p-5 border border-brand-navy/10 flex gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue text-white font-bold text-sm shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="bs-body text-brand-midnight">{item.action}</p>
                  <p className="bs-small text-brand-muted mt-1">Pillar: {item.pillar}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. What's Next (Soft CTA) */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-blue/20 bg-brand-blue/[0.03]">
          <h2 className="bs-h2 mb-4">What's Next</h2>
          <p className="bs-body text-brand-midnight mb-6">{report.whatsNext}</p>
          
          <Link 
            href="/preview/snapshot-plus"
            className="btn-secondary inline-flex"
          >
            See Snapshot+ Structure →
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-brand-navy/10">
          <p className="bs-small text-brand-muted">
            Powered by Wunderbar Digital
          </p>
        </footer>
      </div>
    </main>
  );
}
