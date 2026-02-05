// app/preview/snapshot-plus/page.tsx
// Brand Snapshot+™ ($349) - Preview with new report structure

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ScoreGauge } from "@/src/components/ScoreGauge";

// Mock data matching the new Snapshot+ report structure
const MOCK_REPORT = {
  businessName: "Acme Co",
  executiveSummary: {
    brandAlignmentScore: 72,
    synthesis: "Acme Co has a strong internal understanding of its value but struggles to translate that clarity externally. Positioning is solid at 16/20, yet messaging (15/20) lacks the proof points needed to convert that positioning into trust. Visibility efforts (14/20) are active but unfocused, spreading resources thin. Credibility signals exist but remain hidden at key decision points (13/20). Conversion infrastructure is functional but underleveraged (14/20). The throughline: internal clarity is not reaching external audiences in a way that builds trust and drives action.",
    primaryFocusArea: "Credibility",
    secondaryPillar: "Messaging",
  },
  priorityDiagnosis: {
    whyPrimary: "Credibility is the highest-leverage pillar because your positioning and messaging are already strong — but without visible proof, prospects cannot verify your claims. Trust is the bottleneck.",
    downstreamIssues: "Low credibility visibility forces your messaging to work harder, makes your positioning feel like marketing speak rather than fact, and causes prospects to hesitate at conversion points. Every pillar is underperforming because proof is not doing its job.",
    whatImproves: "When credibility is surfaced at key touchpoints, messaging becomes believable, positioning becomes defensible, and conversion friction drops. One change unlocks momentum across the system.",
  },
  pillarDeepDives: {
    positioning: {
      score: 16,
      interpretation: "Strong — your differentiation is clear internally.",
      whatsHappeningNow: "You know who you serve and why you're different. However, this clarity lives in your head, not on your homepage. Visitors have to dig to understand your value.",
      whyItMattersCommercially: "Unclear positioning on first impression means higher bounce rates, weaker lead quality, and longer sales cycles. You're leaving money on the table in the first 5 seconds.",
      concreteExample: {
        before: "We help businesses grow with strategic marketing solutions.",
        after: "We help B2B service companies turn brand confusion into clarity — so your marketing actually converts.",
      },
      strategicRecommendation: "Rewrite your homepage headline and subhead to reflect your positioning statement. Test it with 5 people outside your company — if they can't repeat back what you do and for whom, iterate.",
      successLooksLike: "A visitor can articulate your value proposition after 10 seconds on your homepage without scrolling.",
    },
    messaging: {
      score: 15,
      interpretation: "Solid foundation — but proof is missing.",
      whatsHappeningNow: "Your core message is benefit-focused and clear. However, supporting messages rely on claims ('we deliver results') rather than evidence ('we increased client revenue by 40% in 90 days').",
      whyItMattersCommercially: "Claims without proof trigger skepticism. In a market where everyone says the same thing, specificity and evidence are your competitive advantage.",
      concreteExample: {
        before: "Our clients see real results from working with us.",
        after: "87% of our clients report measurable ROI within 90 days. Here's how we did it for [Client Name].",
      },
      strategicRecommendation: "Audit your website and sales materials. Replace every claim with a specific outcome, number, or customer quote. If you don't have the data, that's your first action item.",
      successLooksLike: "Every page on your site includes at least one specific, verifiable proof point.",
    },
    visibility: {
      score: 14,
      interpretation: "Active presence — but strategy is unclear.",
      whatsHappeningNow: "You're posting on social, your website is live, and you're present on relevant channels. But content feels reactive — topics shift based on inspiration rather than a plan tied to your positioning.",
      whyItMattersCommercially: "Scattered visibility wastes time and budget. Worse, inconsistent messaging confuses your audience and dilutes brand recall. You become forgettable.",
      concreteExample: {
        before: "Posting 3x/week on LinkedIn about whatever feels relevant that day.",
        after: "A 4-week content calendar with each post tied to one pillar: Week 1 = Positioning, Week 2 = Credibility, Week 3 = Messaging, Week 4 = Conversion.",
      },
      strategicRecommendation: "Create a simple content framework that ties every piece of content to one of your five brand pillars. If it doesn't support a pillar, don't publish it.",
      successLooksLike: "You can look at any piece of content and immediately identify which pillar it strengthens.",
    },
    credibility: {
      score: 13,
      interpretation: "Trust signals exist — but they're hidden.",
      whatsHappeningNow: "You have testimonials, case studies, and satisfied customers. But these assets are buried on a testimonials page or mentioned only in sales calls. They're not doing their job at decision points.",
      whyItMattersCommercially: "Prospects don't visit your testimonials page. They decide on your homepage, pricing page, and contact form. If proof isn't visible at those moments, hesitation wins.",
      concreteExample: {
        before: "Testimonials page with 12 quotes, linked in footer.",
        after: "One strong testimonial on homepage hero. Customer logo bar above the fold. Case study preview on services page.",
      },
      strategicRecommendation: "Identify your top 3 testimonials. Place one on your homepage, one on your services/pricing page, and one on your contact or about page. Make proof impossible to miss.",
      successLooksLike: "A prospect sees social proof within 10 seconds of landing on any key page.",
    },
    conversion: {
      score: 14,
      interpretation: "Functional — but not optimized.",
      whatsHappeningNow: "Your CTAs exist and your contact form works. But there's no lead magnet, no nurture sequence, and no clear next step for visitors who aren't ready to buy today.",
      whyItMattersCommercially: "Only 3% of visitors are ready to buy now. The other 97% need nurturing. Without a low-commitment entry point, you lose the majority of your traffic.",
      concreteExample: {
        before: "'Contact Us' as the only CTA.",
        after: "'Get the Free Brand Clarity Checklist' (lead magnet) + 'Book a Call' (high intent). Two paths for two audiences.",
      },
      strategicRecommendation: "Create one lead magnet that provides immediate value and captures email. Set up a 3-email nurture sequence that builds trust before asking for a call.",
      successLooksLike: "You have two conversion paths: one for high-intent visitors (book a call) and one for early-stage visitors (download a resource).",
    },
  },
  brandArchetypeSystem: {
    primary: "The Sage",
    secondary: "The Guide",
    howTheyWorkTogether: "The Sage provides expertise and credibility; The Guide ensures that expertise is accessible and actionable. Together, they position your brand as a trusted advisor who doesn't just know the answers — but helps others find them.",
    languageToneBehavior: "Lead with insight, not instruction. Ask questions that demonstrate understanding. Share frameworks, not just advice. Avoid jargon that creates distance. Be confident, not condescending. Make the audience feel capable, not dependent.",
  },
  brandPersonaAudienceClarity: {
    whoSpeakingTo: "B2B service company founders and marketing leaders who are frustrated that their marketing doesn't reflect the quality of their work. They're successful but feel invisible or misunderstood in the market.",
    whatAudienceNeeds: "They need to hear that their instinct is right — their brand has value, and the problem is communication, not substance. They need a clear path forward, not more complexity.",
    messagingMistakeToAvoid: "Avoid talking down to them or implying their current efforts are failures. They've built something real. The opportunity is refinement, not reinvention.",
  },
  visualVerbalSignals: {
    colorPaletteDirection: "Navy and deep blue for authority and trust. Bright blue accents for clarity and forward motion. White space for confidence. Avoid overly warm colors that undermine professionalism.",
    voiceTraits: ["Clear", "Confident", "Supportive", "Direct", "Insightful"],
    consistencyRisks: "Avoid shifting between overly casual (social) and overly formal (website). The voice should feel like the same person across all channels — knowledgeable but approachable.",
  },
  strategicActionPlan: [
    { action: "Surface your strongest testimonial on your homepage above the fold.", pillar: "Credibility", outcome: "Immediate trust signal at first impression.", priority: 1 },
    { action: "Rewrite your homepage headline to reflect your positioning statement.", pillar: "Positioning", outcome: "Visitors understand your value in 5 seconds.", priority: 2 },
    { action: "Replace one claim on your services page with a specific outcome or number.", pillar: "Messaging", outcome: "Claims become believable proof.", priority: 3 },
    { action: "Create a simple lead magnet that provides immediate value.", pillar: "Conversion", outcome: "Capture early-stage visitors who aren't ready to buy.", priority: 4 },
    { action: "Build a 4-week content calendar tied to your five pillars.", pillar: "Visibility", outcome: "Content becomes strategic, not scattered.", priority: 5 },
  ],
  whatsNextUnlocks: "Snapshot+ diagnoses and prioritizes. Brand Blueprint takes these insights and turns them into an operational system — messaging frameworks, voice guidelines, visual direction, and AI prompts you can use immediately. Blueprint is where strategy becomes implementation.",
};

const PILLAR_LABELS: Record<string, string> = {
  positioning: "Positioning",
  messaging: "Messaging",
  visibility: "Visibility",
  credibility: "Credibility",
  conversion: "Conversion",
};

export default function PreviewSnapshotPlusPage() {
  const report = MOCK_REPORT;

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Preview Banner */}
        <div className="bs-card rounded-xl bg-[#fff9e6] border-2 border-[#f5e6b3] px-5 py-4 bs-body-sm text-[#8b6914] flex flex-wrap items-center gap-2">
          <span>
            <strong>Preview mode</strong> — Mock data showing new Snapshot+ structure.
          </span>
          <Link href="/preview" className="text-brand-navy font-semibold underline hover:no-underline">
            ← All previews
          </Link>
        </div>

        {/* Header */}
        <header>
          <p className="bs-eyebrow text-brand-blue uppercase tracking-widest text-xs font-black mb-2">Brand Snapshot+™</p>
          <h1 className="bs-h1 mb-1">{report.businessName}</h1>
          <p className="bs-body-sm text-brand-muted">Strategic Brand Diagnostic</p>
        </header>

        {/* 1. Executive Summary */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Executive Summary</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
            <div className="flex flex-col items-center">
              <ScoreGauge score={report.executiveSummary.brandAlignmentScore} size={160} />
              <p className="bs-h3 mt-2">{report.executiveSummary.brandAlignmentScore}/100</p>
              <p className="bs-small text-brand-muted">Brand Alignment Score</p>
            </div>
            <div className="flex-1">
              <p className="bs-body text-brand-midnight leading-relaxed">{report.executiveSummary.synthesis}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-brand-navy/10">
            <div className="bs-card rounded-lg p-4 bg-brand-blue/5 border border-brand-blue/20">
              <p className="bs-small text-brand-blue font-bold uppercase tracking-wide mb-1">Primary Focus Area</p>
              <p className="bs-h3 text-brand-navy">{report.executiveSummary.primaryFocusArea}</p>
            </div>
            <div className="bs-card rounded-lg p-4 bg-brand-navy/5 border border-brand-navy/10">
              <p className="bs-small text-brand-muted font-bold uppercase tracking-wide mb-1">Secondary Pillar</p>
              <p className="bs-h3 text-brand-navy">{report.executiveSummary.secondaryPillar}</p>
            </div>
          </div>
        </section>

        {/* 2. Priority Diagnosis */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-blue/20 bg-brand-blue/[0.02]">
          <h2 className="bs-h2 mb-6">Priority Diagnosis: {report.executiveSummary.primaryFocusArea}</h2>
          
          <div className="space-y-6">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-2">Why This Is Your Primary Focus</p>
              <p className="bs-body text-brand-midnight">{report.priorityDiagnosis.whyPrimary}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-2">Downstream Issues It Creates</p>
              <p className="bs-body text-brand-midnight">{report.priorityDiagnosis.downstreamIssues}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-2">What Improves When Resolved</p>
              <p className="bs-body text-brand-midnight">{report.priorityDiagnosis.whatImproves}</p>
            </div>
          </div>
        </section>

        {/* 3. Pillar Deep Dives */}
        <section>
          <h2 className="bs-h2 mb-2">Pillar Deep Dives</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Strategic analysis of each pillar with concrete examples.</p>
          
          <div className="space-y-6">
            {(["positioning", "messaging", "visibility", "credibility", "conversion"] as const).map((pillar) => {
              const data = report.pillarDeepDives[pillar];
              const scorePercent = (data.score / 20) * 100;
              return (
                <div key={pillar} className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="bs-h3">{PILLAR_LABELS[pillar]}</h3>
                    <span className="bs-h3 text-brand-blue">{data.score}/20</span>
                  </div>
                  <p className="bs-body-sm text-brand-muted mb-4">{data.interpretation}</p>
                  
                  <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${scorePercent}%`,
                        background: `linear-gradient(90deg, #ff3b30 0%, #ff9500 25%, #ffcc00 50%, #8bc34a 75%, #34c759 100%)`,
                        backgroundSize: `${100 / (scorePercent / 100)}% 100%`,
                      }}
                    />
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">What's Happening Now</p>
                      <p className="bs-body-sm text-brand-midnight">{data.whatsHappeningNow}</p>
                    </div>
                    <div>
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Why This Matters Commercially</p>
                      <p className="bs-body-sm text-brand-midnight">{data.whyItMattersCommercially}</p>
                    </div>
                    
                    {/* Concrete Example */}
                    <div className="bg-brand-navy/[0.03] rounded-lg p-4 border border-brand-navy/10">
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">Concrete Example</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="bs-small text-red-600 font-bold mb-1">Before</p>
                          <p className="bs-body-sm text-brand-midnight italic">"{data.concreteExample.before}"</p>
                        </div>
                        <div>
                          <p className="bs-small text-green-600 font-bold mb-1">After</p>
                          <p className="bs-body-sm text-brand-midnight italic">"{data.concreteExample.after}"</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Strategic Recommendation</p>
                      <p className="bs-body-sm text-brand-midnight">{data.strategicRecommendation}</p>
                    </div>
                    <div className="pt-4 border-t border-brand-navy/10">
                      <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Success Looks Like</p>
                      <p className="bs-body-sm text-brand-midnight font-medium">{data.successLooksLike}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Brand Archetype System */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10 bg-brand-navy/[0.02]">
          <h2 className="bs-h2 mb-6">Brand Archetype System</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bs-card rounded-lg p-4 border border-brand-navy/10">
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Primary Archetype</p>
              <p className="bs-h3 text-brand-navy">{report.brandArchetypeSystem.primary}</p>
            </div>
            <div className="bs-card rounded-lg p-4 border border-brand-navy/10">
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Secondary Archetype</p>
              <p className="bs-h3 text-brand-navy">{report.brandArchetypeSystem.secondary}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">How They Work Together</p>
              <p className="bs-body text-brand-midnight">{report.brandArchetypeSystem.howTheyWorkTogether}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Language, Tone & Behavior</p>
              <p className="bs-body text-brand-midnight">{report.brandArchetypeSystem.languageToneBehavior}</p>
            </div>
          </div>
        </section>

        {/* 5. Brand Persona & Audience Clarity */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Brand Persona & Audience Clarity</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Who You're Speaking To</p>
              <p className="bs-body text-brand-midnight">{report.brandPersonaAudienceClarity.whoSpeakingTo}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">What They Need to Hear</p>
              <p className="bs-body text-brand-midnight">{report.brandPersonaAudienceClarity.whatAudienceNeeds}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="bs-small text-red-700 font-bold uppercase tracking-wide mb-1">Messaging Mistake to Avoid</p>
              <p className="bs-body-sm text-red-900">{report.brandPersonaAudienceClarity.messagingMistakeToAvoid}</p>
            </div>
          </div>
        </section>

        {/* 6. Visual & Verbal Brand Signals */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Visual & Verbal Brand Signals</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Color Palette Direction</p>
              <p className="bs-body text-brand-midnight">{report.visualVerbalSignals.colorPaletteDirection}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-2">Voice Traits</p>
              <div className="flex flex-wrap gap-2">
                {report.visualVerbalSignals.voiceTraits.map((trait, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-brand-blue/10 text-brand-navy text-sm font-semibold rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="bs-small text-amber-700 font-bold uppercase tracking-wide mb-1">Consistency Risk</p>
              <p className="bs-body-sm text-amber-900">{report.visualVerbalSignals.consistencyRisks}</p>
            </div>
          </div>
        </section>

        {/* 7. Strategic Action Plan */}
        <section>
          <h2 className="bs-h2 mb-2">Strategic Action Plan</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Five prioritized actions ordered by impact.</p>
          
          <div className="space-y-4">
            {report.strategicActionPlan.map((item, idx) => (
              <div key={idx} className="bs-card rounded-xl p-5 border border-brand-navy/10 flex gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue text-white font-bold text-sm shrink-0">
                  {item.priority}
                </span>
                <div className="flex-1">
                  <p className="bs-body text-brand-midnight font-medium">{item.action}</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="bs-small text-brand-muted">Pillar: <strong className="text-brand-navy">{item.pillar}</strong></span>
                    <span className="bs-small text-brand-muted">Outcome: <strong className="text-brand-navy">{item.outcome}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. What This Unlocks Next (Soft CTA) */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-blue/20 bg-brand-blue/[0.03]">
          <h2 className="bs-h2 mb-4">What This Unlocks Next</h2>
          <p className="bs-body text-brand-midnight mb-6">{report.whatsNextUnlocks}</p>
          
          <Link 
            href="/preview/blueprint"
            className="btn-secondary inline-flex"
          >
            See Blueprint Structure →
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
