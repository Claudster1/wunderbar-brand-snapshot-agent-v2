// app/preview/blueprint-plus/page.tsx
// Brand Blueprint+™ ($1,199) - Preview with new report structure

export const dynamic = "force-dynamic";

import Link from "next/link";

// Mock data matching the new Blueprint+ report structure
const MOCK_REPORT = {
  businessName: "Acme Co",
  strategicOverview: {
    wherePositioned: "Acme Co is positioned to become the definitive brand clarity partner for B2B service companies in the $1M-$50M revenue range. The market is saturated with tactical marketing agencies but underserved by strategic brand partners who combine clarity with execution. This gap is your opportunity.",
    leverageCreated: "This Blueprint+ creates leverage in three ways: (1) A messaging system that scales across channels without losing consistency, (2) Audience segmentation that enables personalized outreach without personalized effort, (3) An AI prompt library that allows anyone on your team to produce on-brand content. The result: more output, less chaos, compounding brand equity.",
  },
  advancedAudienceSegmentation: {
    coreSegments: [
      {
        segment: "Founders (Decision Makers)",
        messagingDifferentiation: "Focus on strategic outcomes: clarity, confidence, competitive advantage. They care about results, not process. Lead with transformation, not methodology.",
        channelRelevance: "LinkedIn (primary), Email (nurture), Direct outreach (high-value), Podcast appearances",
      },
      {
        segment: "Marketing Leaders (Influencers)",
        messagingDifferentiation: "Focus on execution and tools: frameworks, templates, systems. They need ammunition to present internally and resources to do their job better.",
        channelRelevance: "LinkedIn, Email, Blog/SEO, Webinars, Community forums",
      },
      {
        segment: "Marketing Team Members (Users)",
        messagingDifferentiation: "Focus on clarity and confidence: how to know if they're doing it right. They want guardrails and examples, not theory.",
        channelRelevance: "Blog/SEO, Social (educational content), Templates and downloads, Newsletter",
      },
    ],
  },
  advancedMessagingMatrix: {
    byAudience: [
      { audience: "Founders", message: "Your brand has value. The problem is communication, not substance. We make what's true visible." },
      { audience: "Marketing Leaders", message: "Stop reinventing the wheel. We give you the system and language to execute with confidence." },
      { audience: "Marketing Teams", message: "Know exactly what to say, how to say it, and why it works. Clarity removes guesswork." },
    ],
    byFunnelStage: {
      awareness: "Most B2B marketing fails because it's disconnected from reality. There's a better way.",
      consideration: "Brand Snapshot reveals where your brand stands today. Snapshot+ shows you why and what to do about it.",
      decision: "Blueprint is your operating system. It's not a document you file — it's a tool you use daily.",
      retention: "Your brand evolves. We help you maintain clarity as you scale without starting over.",
    },
    byChannel: {
      website: "Clear, confident, benefit-focused. Lead with outcomes, support with methodology. Social proof at every decision point.",
      email: "Personal, insightful, action-oriented. Each email should deliver value and end with one clear next step.",
      social: "Thought leadership that demonstrates expertise. Teach, don't pitch. Engage, don't broadcast.",
      paid: "Problem-aware targeting. 'Frustrated that your marketing doesn't reflect your true value?' + clear CTA.",
      sales: "Listen first. Diagnose before prescribing. Make the prospect feel understood, not sold to.",
    },
  },
  brandArchitectureExpansion: {
    howBrandCanStretch: "Acme Co can expand into adjacent offerings (consulting, courses, community) without brand confusion if each extension maps back to the core promise: clarity converts. The test: does this new offering help B2B service companies close the gap between what they deliver and how they're perceived? If yes, it fits.",
    subBrandAlignment: "If product tiers become distinct brands (e.g., 'Acme Snapshot' vs. 'Acme Blueprint'), maintain visual consistency and voice traits. Differentiate by outcome level, not by brand personality. Same Sage archetype, different depth of transformation.",
  },
  campaignContentStrategy: {
    campaignThemes: [
      "The Clarity Gap — Why great companies stay invisible",
      "Marketing That Tells the Truth — Authenticity as competitive advantage",
      "From Confusion to Confidence — The transformation journey",
      "Proof Over Promise — Why specificity wins",
    ],
    narrativeArcs: [
      "The founder who built something great but couldn't explain it — until they found clarity",
      "The marketing leader who was tired of tactics without strategy — and discovered alignment",
      "The company that thought they had a marketing problem but actually had a positioning problem",
    ],
    longTermStorytelling: "Over 12+ months, build a body of content that establishes Acme Co as the definitive voice on B2B brand clarity. Document client transformations. Share methodology openly. Create resources competitors can't match. The goal: when someone thinks 'brand clarity for B2B,' they think Acme Co.",
  },
  advancedAiPromptLibrary: {
    campaignPrompts: [
      "Create a 4-week LinkedIn campaign for Acme Co around the theme 'The Clarity Gap.' Week 1: Problem awareness. Week 2: Myth-busting. Week 3: Framework introduction. Week 4: CTA to Brand Snapshot. Each week = 3 posts.",
      "Write an email sequence (5 emails) for leads who downloaded the Brand Clarity Checklist. Goal: nurture to Brand Snapshot+ purchase. Tone: Sage archetype — insightful, not pushy.",
      "Generate ad copy variations for a LinkedIn campaign targeting B2B service company founders. Pain point: 'Your marketing doesn't reflect your true value.' CTA: Free Brand Snapshot.",
    ],
    funnelPrompts: [
      "Write a landing page for Brand Snapshot+ targeting founders who completed the free Snapshot. Structure: Remind them of their score → Show what Snapshot+ adds → Social proof → CTA. Length: 500-700 words.",
      "Create a sales page for Blueprint that speaks to marketing leaders. Focus on the operational value: systems, frameworks, AI prompts. Address objection: 'We already have a brand guide.'",
      "Generate a cart abandonment email for someone who started but didn't complete Brand Snapshot+ checkout. Tone: Helpful, not desperate. Offer: none — just remind them of the value.",
    ],
    seoAeoPrompts: [
      "Write a comprehensive blog post (2000+ words) targeting the keyword 'B2B brand positioning.' Structure for featured snippet capture. Include: definition, why it matters, common mistakes, framework, examples, CTA.",
      "Create an FAQ page for Brand Snapshot Suite that answers the top 10 questions prospects ask. Optimize for AI assistant citation — clear questions, direct answers, no fluff.",
      "Generate schema-ready content for Acme Co's services page. Include: service name, description, target audience, expected outcome, price range, testimonial.",
    ],
    contentScalingPrompts: [
      "Repurpose this [paste blog post] into: (1) LinkedIn post, (2) Email newsletter section, (3) Twitter thread, (4) Carousel outline. Maintain brand voice: clear, confident, supportive, direct, insightful.",
      "Generate 20 content ideas for Q1 based on these themes: [paste campaign themes]. Mix: 10 thought leadership, 5 case study teasers, 3 tactical how-tos, 2 controversial takes.",
      "Create a content brief template for freelance writers working on Acme Co content. Include: voice guidelines, structural requirements, proof point expectations, what to avoid.",
    ],
    internalAlignmentPrompts: [
      "Write an internal memo introducing the new Brand Blueprint to the Acme Co team. Explain: what it is, why it matters, how to use it, where to find it. Tone: Clear and motivating.",
      "Create a quick-reference card (1 page) summarizing Acme Co's positioning, voice traits, and key messages. For team members to keep at their desk.",
      "Generate onboarding content for new hires that explains Acme Co's brand in 5 minutes. Include: who we serve, what we believe, how we're different, how we talk.",
    ],
  },
  measurementOptimization: {
    whatToTrack: [
      "Brand Snapshot completion rate (awareness → conversion)",
      "Snapshot → Snapshot+ upgrade rate",
      "Time-to-close for Blueprint sales",
      "Content engagement rate by pillar theme",
      "Branded search volume over time",
      "Client retention and expansion",
    ],
    signalsThatMatter: [
      "Prospects referencing your content before first call = content is working",
      "Decrease in 'What exactly do you do?' questions = positioning is landing",
      "Increase in inbound qualified leads = visibility + credibility compounding",
      "Clients staying 12+ months = delivery matches promise",
      "Referrals from existing clients = trust earned",
    ],
    howToAdapt: "Review metrics quarterly. If conversion is down but traffic is up, the problem is messaging or credibility — not visibility. If traffic is down, revisit content strategy. Never change positioning based on a single metric; look for patterns across 90+ days. Brand changes compound slowly — give strategy time to work before pivoting.",
  },
  strategicGuardrails: {
    whatNeverChanges: [
      "Core promise: Clarity converts",
      "Primary archetype: The Sage",
      "Target audience: B2B service companies",
      "Voice traits: Clear, confident, supportive, direct, insightful",
      "Proof-first approach: Claims always backed by evidence",
    ],
    whatCanEvolve: [
      "Specific language and phrasing (test and optimize)",
      "Channel mix (follow where audience attention shifts)",
      "Product offerings (as long as they map to core promise)",
      "Visual details (refresh within brand system)",
      "Tactical campaigns (seasonal, trend-responsive)",
    ],
    maintainingIntegrityAtScale: "As you grow, brand drift becomes the biggest risk. Prevent it by: (1) Making this Blueprint the onboarding foundation for every hire and contractor, (2) Reviewing content against guardrails monthly, (3) Empowering team members to flag inconsistencies without hierarchy, (4) Updating the Blueprint annually to reflect learnings while maintaining core identity.",
  },
};

export default function PreviewBlueprintPlusPage() {
  const report = MOCK_REPORT;

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Preview Banner */}
        <div className="bs-card rounded-xl bg-[#fff9e6] border-2 border-[#f5e6b3] px-5 py-4 bs-body-sm text-[#8b6914] flex flex-wrap items-center gap-2">
          <span>
            <strong>Preview mode</strong> — Mock data showing new Blueprint+ structure.
          </span>
          <Link href="/preview" className="text-brand-navy font-semibold underline hover:no-underline">
            ← All previews
          </Link>
        </div>

        {/* Header */}
        <header>
          <p className="bs-eyebrow text-brand-blue uppercase tracking-widest text-xs font-black mb-2">Brand Blueprint+™</p>
          <h1 className="bs-h1 mb-1">{report.businessName}</h1>
          <p className="bs-body-sm text-brand-muted">Advanced Brand Strategy System</p>
        </header>

        {/* 1. Strategic Overview */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-navy/20 bg-brand-navy/[0.02]">
          <h2 className="bs-h2 mb-6">Strategic Overview</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Where You're Positioned to Go</p>
              <p className="bs-body text-brand-midnight">{report.strategicOverview.wherePositioned}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Leverage This Blueprint Creates</p>
              <p className="bs-body text-brand-midnight">{report.strategicOverview.leverageCreated}</p>
            </div>
          </div>
        </section>

        {/* 2. Advanced Audience Segmentation */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Advanced Audience Segmentation</h2>
          
          <div className="space-y-4">
            {report.advancedAudienceSegmentation.coreSegments.map((seg, idx) => (
              <div key={idx} className="bg-brand-blue/[0.03] rounded-lg p-5 border border-brand-blue/20">
                <h3 className="bs-h4 text-brand-navy mb-3">{seg.segment}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Messaging Differentiation</p>
                    <p className="bs-body-sm text-brand-midnight">{seg.messagingDifferentiation}</p>
                  </div>
                  <div>
                    <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Channel Relevance</p>
                    <p className="bs-body-sm text-brand-midnight">{seg.channelRelevance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Advanced Messaging Matrix */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Advanced Messaging Matrix</h2>
          
          {/* By Audience */}
          <div className="mb-8">
            <h3 className="bs-h4 text-brand-navy mb-4">Message by Audience</h3>
            <div className="space-y-3">
              {report.advancedMessagingMatrix.byAudience.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <span className="bs-small text-brand-blue font-bold min-w-[120px]">{item.audience}</span>
                  <p className="bs-body-sm text-brand-midnight italic">"{item.message}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* By Funnel Stage */}
          <div className="mb-8">
            <h3 className="bs-h4 text-brand-navy mb-4">Message by Funnel Stage</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {(["awareness", "consideration", "decision", "retention"] as const).map((stage) => (
                <div key={stage} className="bs-card rounded-lg p-4 border border-brand-navy/10">
                  <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">{stage.charAt(0).toUpperCase() + stage.slice(1)}</p>
                  <p className="bs-body-sm text-brand-midnight">{report.advancedMessagingMatrix.byFunnelStage[stage]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* By Channel */}
          <div>
            <h3 className="bs-h4 text-brand-navy mb-4">Message by Channel</h3>
            <div className="space-y-3">
              {(["website", "email", "social", "paid", "sales"] as const).map((channel) => (
                <div key={channel} className="bs-card rounded-lg p-4 border border-brand-navy/10">
                  <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">{channel.charAt(0).toUpperCase() + channel.slice(1)}</p>
                  <p className="bs-body-sm text-brand-midnight">{report.advancedMessagingMatrix.byChannel[channel]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Brand Architecture & Expansion */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10 bg-brand-navy/[0.02]">
          <h2 className="bs-h2 mb-6">Brand Architecture & Expansion</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">How the Brand Can Stretch</p>
              <p className="bs-body text-brand-midnight">{report.brandArchitectureExpansion.howBrandCanStretch}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Sub-Brand Alignment</p>
              <p className="bs-body text-brand-midnight">{report.brandArchitectureExpansion.subBrandAlignment}</p>
            </div>
          </div>
        </section>

        {/* 5. Campaign & Content Strategy */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Campaign & Content Strategy</h2>
          
          <div className="space-y-6">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">Campaign Themes</p>
              <div className="grid md:grid-cols-2 gap-3">
                {report.campaignContentStrategy.campaignThemes.map((theme, idx) => (
                  <div key={idx} className="bg-brand-blue/5 rounded-lg p-4 border border-brand-blue/20">
                    <p className="bs-body-sm text-brand-midnight font-medium">{theme}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">Narrative Arcs</p>
              <ul className="space-y-2">
                {report.campaignContentStrategy.narrativeArcs.map((arc, idx) => (
                  <li key={idx} className="bs-body-sm text-brand-midnight pl-4 border-l-2 border-brand-blue/30">{arc}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Long-Term Brand Storytelling</p>
              <p className="bs-body text-brand-midnight">{report.campaignContentStrategy.longTermStorytelling}</p>
            </div>
          </div>
        </section>

        {/* 6. Advanced AI Prompt Library */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-2">Advanced AI Prompt Library</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Enterprise-grade prompts for scale.</p>
          
          <div className="space-y-8">
            {([
              { key: "campaignPrompts", label: "Campaign Prompts" },
              { key: "funnelPrompts", label: "Funnel Prompts" },
              { key: "seoAeoPrompts", label: "SEO / AEO Prompts" },
              { key: "contentScalingPrompts", label: "Content Scaling Prompts" },
              { key: "internalAlignmentPrompts", label: "Internal Alignment Prompts" },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">{label}</p>
                <div className="space-y-2">
                  {report.advancedAiPromptLibrary[key].map((prompt, idx) => (
                    <div key={idx} className="bg-brand-navy/[0.03] rounded-lg p-4 border border-brand-navy/10">
                      <p className="bs-body-sm text-brand-midnight font-mono text-sm">{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Measurement & Optimization */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Measurement & Optimization</h2>
          
          <div className="space-y-6">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">What to Track</p>
              <div className="grid md:grid-cols-2 gap-2">
                {report.measurementOptimization.whatToTrack.map((item, idx) => (
                  <div key={idx} className="bs-card rounded-lg p-3 border border-brand-navy/10 bs-body-sm text-brand-midnight">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">Signals That Matter</p>
              <ul className="space-y-2">
                {report.measurementOptimization.signalsThatMatter.map((signal, idx) => (
                  <li key={idx} className="bs-body-sm text-brand-midnight flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">→</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">How to Adapt</p>
              <p className="bs-body text-brand-midnight">{report.measurementOptimization.howToAdapt}</p>
            </div>
          </div>
        </section>

        {/* 8. Strategic Guardrails */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Strategic Guardrails</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="bs-small text-green-700 font-bold uppercase tracking-wide mb-2">What Never Changes</p>
              <ul className="space-y-2">
                {report.strategicGuardrails.whatNeverChanges.map((item, idx) => (
                  <li key={idx} className="bs-body-sm text-green-900 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="bs-small text-amber-700 font-bold uppercase tracking-wide mb-2">What Can Evolve</p>
              <ul className="space-y-2">
                {report.strategicGuardrails.whatCanEvolve.map((item, idx) => (
                  <li key={idx} className="bs-body-sm text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">↻</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Maintaining Integrity at Scale</p>
            <p className="bs-body text-brand-midnight">{report.strategicGuardrails.maintainingIntegrityAtScale}</p>
          </div>
        </section>

        {/* Services CTA (no product upsell) */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-navy/10 bg-brand-blue/[0.03]">
          <h2 className="bs-h2 mb-4">Work with Us</h2>
          <p className="bs-body text-brand-midnight mb-6">
            Put your brand system into action with our services:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bs-card rounded-lg p-5 border border-brand-navy/10 bg-white">
              <h3 className="bs-h4 text-brand-navy mb-2">Managed Marketing</h3>
              <p className="bs-body-sm text-brand-midnight mb-4">
                We run your marketing so you can focus on your business — strategy, content, campaigns, and performance aligned to your brand.
              </p>
              <Link href="https://wunderbardigital.com" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-semibold text-sm hover:underline">
                Learn more →
              </Link>
            </div>
            <div className="bs-card rounded-lg p-5 border border-brand-navy/10 bg-white">
              <h3 className="bs-h4 text-brand-navy mb-2">AI Consulting</h3>
              <p className="bs-body-sm text-brand-midnight mb-4">
                We help you adopt AI confidently — from brand-safe prompts and workflows to AI strategy and implementation so your brand stays consistent at scale.
              </p>
              <Link href="https://wunderbardigital.com" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-semibold text-sm hover:underline">
                Learn more →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-brand-navy/10">
          <p className="bs-small text-brand-muted">
            Brand Blueprint+™ by Wunderbar Digital
          </p>
        </footer>
      </div>
    </main>
  );
}
