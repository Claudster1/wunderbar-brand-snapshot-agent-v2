// app/preview/blueprint/page.tsx
// Brand Blueprint™ ($699) - Preview with new report structure

export const dynamic = "force-dynamic";

import Link from "next/link";

// Mock data matching the new Blueprint report structure
const MOCK_REPORT = {
  businessName: "Acme Co",
  blueprintOverview: {
    whatThisEnables: "This Brand Blueprint is your operational system for consistent, strategic brand execution. It defines how your brand speaks, looks, converts, and maintains integrity across every touchpoint. Use it as the source of truth for marketing decisions, content creation, sales conversations, and team alignment.",
    howToUse: "Reference this document before creating any external communication. Share relevant sections with contractors, agencies, and team members. Review quarterly to ensure execution matches strategy. Update only when business fundamentals change — not based on trends or preferences.",
  },
  brandFoundation: {
    brandPurpose: "To eliminate the gap between what businesses deliver and how they're perceived — so that great work gets the recognition it deserves.",
    brandPromise: "We deliver clarity that converts. Every engagement ends with a clearer understanding of your brand and a concrete path to stronger market position.",
    positioningStatement: "For B2B service companies frustrated that their marketing doesn't reflect the quality of their work, Acme Co is the brand clarity partner that transforms confusion into confidence — so your expertise becomes visible, trusted, and chosen.",
    differentiationNarrative: "Most marketing agencies focus on tactics — more content, more ads, more channels. We focus on alignment. We ensure every piece of marketing reflects who you actually are and what you actually deliver. The result is marketing that doesn't just look good — it works, because it's true.",
  },
  audiencePersonaDefinition: {
    primaryAudience: "B2B service company founders and marketing leaders (typically 10-100 employees) who have built something valuable but feel invisible or misunderstood in the market. They've tried various marketing approaches but nothing seems to capture their true value.",
    secondaryAudience: "Marketing team members at mid-sized B2B companies who need frameworks and language to execute consistently. They have skills but lack strategic clarity from leadership.",
    decisionDrivers: [
      "Proof that we understand their specific challenge (not generic marketing talk)",
      "Clear methodology that feels structured but not rigid",
      "Evidence of results with similar companies",
      "Confidence that we'll make their life easier, not harder",
    ],
    objectionsToOvercome: [
      "We've worked with agencies before and it didn't work",
      "We don't have time for a long discovery process",
      "How is this different from what we could do ourselves?",
      "Our industry is different — will this apply to us?",
    ],
  },
  brandArchetypeActivation: {
    primaryArchetype: "The Sage",
    secondaryArchetype: "The Guide",
    activation: {
      messaging: "Lead with insight. Share observations before recommendations. Ask questions that reveal understanding. Use frameworks to structure complexity. Avoid jargon that creates distance.",
      content: "Publish thought leadership that demonstrates expertise without showing off. Create resources that genuinely help — even for non-customers. Teach principles, not just tactics.",
      salesConversations: "Listen more than pitch. Diagnose before prescribing. Be honest about fit — refer out when appropriate. Make the prospect feel understood, not sold to.",
      visualTone: "Clean, confident, and professional. Enough white space to breathe. Visuals that clarify, not decorate. Color used intentionally to guide attention, not impress.",
    },
  },
  messagingSystem: {
    coreMessage: "Clarity converts. We help B2B service companies close the gap between what they deliver and how they're perceived — so their marketing actually works.",
    supportingMessages: [
      "Your brand has value. The problem is communication, not substance.",
      "Most marketing fails because it's disconnected from reality. We start with what's true.",
      "We don't make you look good. We make you understood — which is better.",
      "Strategy without execution is a document. We build systems you can actually use.",
    ],
    proofPoints: [
      "87% of clients report measurable ROI within 90 days",
      "Average client engagement: 18 months (they stay because it works)",
      "50+ B2B service companies transformed from confused to confident",
      "Methodology refined over 8 years and 200+ engagements",
    ],
    whatNotToSay: [
      "We're the best agency in [city/industry]",
      "We do everything — strategy, design, content, ads, etc.",
      "Trust us — we know what we're doing",
      "Our process is proprietary and secret",
      "Results may vary (even if legally required, reframe positively)",
    ],
  },
  visualDirection: {
    colorPaletteGuidance: "Primary: Navy (#021859) — authority, trust, depth. Use for headlines, key text, and primary CTAs. Accent: Bright Blue (#07B0F2) — clarity, action, optimism. Use for highlights, links, and secondary CTAs. Background: White and light gray — confidence, space, professionalism. Avoid: Overly warm colors (orange, red) that undermine professional tone.",
    typographyTone: "Clean, modern sans-serif. Lato or similar. Headlines: Bold but not aggressive. Body: Readable, generous line height. Avoid: Script fonts, overly decorative type, all-caps body text.",
    visualConsistencyPrinciples: "Every visual should feel like it came from the same brain. When in doubt, simpler is better. Photography should feature real people in real work contexts — not stock poses. Icons and illustrations should clarify, not decorate.",
  },
  conversionStrategy: {
    howTrustIsBuilt: "Trust is built through specificity and proof. Every claim should be supported by evidence. Every promise should be kept. Every interaction should demonstrate competence, not just claim it. Consistency across touchpoints compounds trust over time.",
    howClarityDrivesAction: "When visitors immediately understand what you do, who you help, and why you're different, the decision to engage becomes obvious. Remove friction by removing confusion. Make the next step clear and low-risk.",
    ctaHierarchy: "Primary: Book a Call (high intent, ready to engage). Secondary: Download a resource (lower commitment, building trust). Tertiary: Subscribe to newsletter (staying connected, not ready to act). Every page should have exactly one clear next step.",
  },
  aiPromptPack: {
    messagingPrompts: [
      "Write a homepage headline for Acme Co that communicates our positioning: 'We help B2B service companies close the gap between what they deliver and how they're perceived.' The headline should be clear, confident, and benefit-focused. Avoid jargon and marketing speak.",
      "Generate 5 subject lines for an email to B2B service company founders who feel their marketing doesn't reflect their true value. Tone: Sage archetype — insightful, not pushy.",
      "Rewrite this [paste copy] to align with Acme Co's brand voice: clear, confident, supportive, direct, insightful. Remove hedging language and make claims specific.",
    ],
    contentPrompts: [
      "Write a LinkedIn post for Acme Co about why most B2B marketing fails. Structure: Insight → Problem → Reframe → Subtle CTA. Length: 150-200 words. Tone: Sage archetype.",
      "Create an outline for a blog post titled 'The 5 Signs Your Brand Positioning Is Costing You Deals.' Each sign should be specific and actionable. Include a brief intro and CTA for Brand Snapshot.",
      "Generate 10 content ideas for Acme Co's LinkedIn that demonstrate expertise in brand clarity for B2B service companies. Mix of thought leadership, case study teasers, and actionable tips.",
    ],
    websitePrompts: [
      "Write the About page copy for Acme Co. Structure: Why we exist → What we believe → How we work → Who we help → What makes us different. Length: 400-500 words. Tone: Confident but not arrogant.",
      "Create copy for a services page section explaining Brand Snapshot+. Include: What it is, who it's for, what's included, expected outcome. Avoid feature lists — focus on transformation.",
      "Write a testimonial request email to send to past clients. Ask for specific outcomes, not generic praise. Make it easy to respond with prompting questions.",
    ],
    socialPrompts: [
      "Generate a week of LinkedIn posts for Acme Co. Theme: Brand clarity as competitive advantage. Mix formats: text-only insight, carousel idea, poll question, mini case study.",
      "Write 5 Twitter/X posts that could start conversations about B2B brand strategy. Provocative but not controversial. Designed to get thoughtful replies.",
      "Create a LinkedIn article outline: 'Why Your Competitors With Worse Products Are Winning More Deals.' Thesis: Clarity beats quality when quality isn't communicated.",
    ],
  },
  executionGuardrails: {
    whatToMaintain: [
      "Positioning statement and core message — these are foundational",
      "Voice traits: clear, confident, supportive, direct, insightful",
      "Visual consistency: navy + bright blue, clean sans-serif, generous white space",
      "Proof-first approach: claims always backed by evidence",
      "Archetype alignment: Sage + Guide in every interaction",
    ],
    whatToAvoid: [
      "Generic marketing language that could apply to anyone",
      "Promising things you can't deliver consistently",
      "Copying competitor tactics without strategic alignment",
      "Chasing trends that don't fit your archetype",
      "Inconsistent voice across channels (casual social vs. formal website)",
    ],
    driftIndicators: [
      "Team members unsure how to describe what you do",
      "Marketing materials that feel disconnected from each other",
      "Prospects surprised by what you actually deliver",
      "Feedback that your marketing feels generic or unclear",
      "Metrics that show traffic but not conversion",
    ],
  },
};

export default function PreviewBlueprintPage() {
  const report = MOCK_REPORT;

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Preview Banner */}
        <div className="bs-card rounded-xl bg-[#fff9e6] border-2 border-[#f5e6b3] px-5 py-4 bs-body-sm text-[#8b6914] flex flex-wrap items-center gap-2">
          <span>
            <strong>Preview mode</strong> — Mock data showing new Blueprint structure.
          </span>
          <Link href="/preview" className="text-brand-navy font-semibold underline hover:no-underline">
            ← All previews
          </Link>
        </div>

        {/* Header */}
        <header>
          <p className="bs-eyebrow text-brand-blue uppercase tracking-widest text-xs font-black mb-2">Brand Blueprint™</p>
          <h1 className="bs-h1 mb-1">{report.businessName}</h1>
          <p className="bs-body-sm text-brand-muted">Brand Operating System</p>
        </header>

        {/* 1. Blueprint Overview */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Blueprint Overview</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">What This System Enables</p>
              <p className="bs-body text-brand-midnight">{report.blueprintOverview.whatThisEnables}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">How to Use This Document</p>
              <p className="bs-body text-brand-midnight">{report.blueprintOverview.howToUse}</p>
            </div>
          </div>
        </section>

        {/* 2. Brand Foundation */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-navy/20 bg-brand-navy/[0.02]">
          <h2 className="bs-h2 mb-6">Brand Foundation</h2>
          
          <div className="space-y-6">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Brand Purpose</p>
              <p className="bs-body text-brand-midnight font-medium">{report.brandFoundation.brandPurpose}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Brand Promise</p>
              <p className="bs-body text-brand-midnight font-medium">{report.brandFoundation.brandPromise}</p>
            </div>
            <div className="bg-brand-blue/5 rounded-lg p-5 border border-brand-blue/20">
              <p className="bs-small text-brand-blue font-bold uppercase tracking-wide mb-2">Positioning Statement</p>
              <p className="bs-body text-brand-midnight italic">"{report.brandFoundation.positioningStatement}"</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Differentiation Narrative</p>
              <p className="bs-body text-brand-midnight">{report.brandFoundation.differentiationNarrative}</p>
            </div>
          </div>
        </section>

        {/* 3. Audience & Persona Definition */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Audience & Persona Definition</h2>
          
          <div className="space-y-6">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Primary Audience</p>
              <p className="bs-body text-brand-midnight">{report.audiencePersonaDefinition.primaryAudience}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Secondary Audience</p>
              <p className="bs-body text-brand-midnight">{report.audiencePersonaDefinition.secondaryAudience}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="bs-small text-green-700 font-bold uppercase tracking-wide mb-2">Decision Drivers</p>
                <ul className="space-y-2">
                  {report.audiencePersonaDefinition.decisionDrivers.map((item, idx) => (
                    <li key={idx} className="bs-body-sm text-green-900 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="bs-small text-amber-700 font-bold uppercase tracking-wide mb-2">Objections to Overcome</p>
                <ul className="space-y-2">
                  {report.audiencePersonaDefinition.objectionsToOvercome.map((item, idx) => (
                    <li key={idx} className="bs-body-sm text-amber-900 flex items-start gap-2">
                      <span className="text-amber-600 mt-1">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Brand Archetype Activation */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10 bg-brand-navy/[0.02]">
          <h2 className="bs-h2 mb-6">Brand Archetype Activation</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bs-card rounded-lg p-4 border border-brand-navy/10 bg-white">
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Primary</p>
              <p className="bs-h3 text-brand-navy">{report.brandArchetypeActivation.primaryArchetype}</p>
            </div>
            <div className="bs-card rounded-lg p-4 border border-brand-navy/10 bg-white">
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Secondary</p>
              <p className="bs-h3 text-brand-navy">{report.brandArchetypeActivation.secondaryArchetype}</p>
            </div>
          </div>

          <div className="space-y-4">
            {(["messaging", "content", "salesConversations", "visualTone"] as const).map((key) => (
              <div key={key} className="bs-card rounded-lg p-4 border border-brand-navy/10 bg-white">
                <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">
                  {key === "salesConversations" ? "Sales Conversations" : key === "visualTone" ? "Visual Tone" : key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <p className="bs-body-sm text-brand-midnight">{report.brandArchetypeActivation.activation[key]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Messaging System */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Messaging System</h2>
          
          <div className="space-y-6">
            <div className="bg-brand-blue/5 rounded-lg p-5 border border-brand-blue/20">
              <p className="bs-small text-brand-blue font-bold uppercase tracking-wide mb-2">Core Message</p>
              <p className="bs-body text-brand-midnight font-medium">{report.messagingSystem.coreMessage}</p>
            </div>

            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">Supporting Messages</p>
              <ul className="space-y-2">
                {report.messagingSystem.supportingMessages.map((msg, idx) => (
                  <li key={idx} className="bs-body-sm text-brand-midnight pl-4 border-l-2 border-brand-blue/30">{msg}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">Proof Points</p>
              <div className="grid md:grid-cols-2 gap-3">
                {report.messagingSystem.proofPoints.map((point, idx) => (
                  <div key={idx} className="bs-card rounded-lg p-3 border border-brand-navy/10 bs-body-sm text-brand-midnight">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="bs-small text-red-700 font-bold uppercase tracking-wide mb-2">What NOT to Say</p>
              <ul className="space-y-1">
                {report.messagingSystem.whatNotToSay.map((item, idx) => (
                  <li key={idx} className="bs-body-sm text-red-900 flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Visual Direction */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Visual Direction</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Color Palette Guidance</p>
              <p className="bs-body text-brand-midnight">{report.visualDirection.colorPaletteGuidance}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Typography Tone</p>
              <p className="bs-body text-brand-midnight">{report.visualDirection.typographyTone}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">Visual Consistency Principles</p>
              <p className="bs-body text-brand-midnight">{report.visualDirection.visualConsistencyPrinciples}</p>
            </div>
          </div>
        </section>

        {/* 7. Conversion Strategy */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10 bg-brand-blue/[0.02]">
          <h2 className="bs-h2 mb-6">Conversion Strategy</h2>
          
          <div className="space-y-5">
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">How Trust Is Built</p>
              <p className="bs-body text-brand-midnight">{report.conversionStrategy.howTrustIsBuilt}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">How Clarity Drives Action</p>
              <p className="bs-body text-brand-midnight">{report.conversionStrategy.howClarityDrivesAction}</p>
            </div>
            <div>
              <p className="bs-small text-brand-muted uppercase tracking-wide mb-1">CTA Hierarchy</p>
              <p className="bs-body text-brand-midnight">{report.conversionStrategy.ctaHierarchy}</p>
            </div>
          </div>
        </section>

        {/* 8. AI Prompt Pack */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">AI Prompt Pack</h2>
          <p className="bs-body-sm text-brand-muted mb-6">Ready-to-use prompts for consistent brand execution.</p>
          
          <div className="space-y-6">
            {(["messagingPrompts", "contentPrompts", "websitePrompts", "socialPrompts"] as const).map((category) => (
              <div key={category}>
                <p className="bs-small text-brand-muted uppercase tracking-wide mb-3">
                  {category === "messagingPrompts" ? "Messaging Prompts" :
                   category === "contentPrompts" ? "Content Prompts" :
                   category === "websitePrompts" ? "Website Prompts" : "Social Prompts"}
                </p>
                <div className="space-y-2">
                  {report.aiPromptPack[category].map((prompt, idx) => (
                    <div key={idx} className="bg-brand-navy/[0.03] rounded-lg p-4 border border-brand-navy/10">
                      <p className="bs-body-sm text-brand-midnight font-mono">{prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Execution Guardrails */}
        <section className="bs-card rounded-xl p-6 md:p-8 border border-brand-navy/10">
          <h2 className="bs-h2 mb-6">Execution Guardrails</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="bs-small text-green-700 font-bold uppercase tracking-wide mb-2">What to Maintain</p>
              <ul className="space-y-2">
                {report.executionGuardrails.whatToMaintain.map((item, idx) => (
                  <li key={idx} className="bs-body-sm text-green-900 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="bs-small text-red-700 font-bold uppercase tracking-wide mb-2">What to Avoid</p>
              <ul className="space-y-2">
                {report.executionGuardrails.whatToAvoid.map((item, idx) => (
                  <li key={idx} className="bs-body-sm text-red-900 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="bs-small text-amber-700 font-bold uppercase tracking-wide mb-2">Drift Indicators</p>
              <ul className="space-y-2">
                {report.executionGuardrails.driftIndicators.map((item, idx) => (
                  <li key={idx} className="bs-body-sm text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA to Blueprint+ */}
        <section className="bs-card rounded-xl p-6 md:p-8 border-2 border-brand-blue/20 bg-brand-blue/[0.03]">
          <h2 className="bs-h2 mb-4">Ready for More?</h2>
          <p className="bs-body text-brand-midnight mb-6">
            Brand Blueprint+ takes this system further — with advanced audience segmentation, multi-channel messaging matrices, campaign strategy, and an expanded AI prompt library for scale.
          </p>
          
          <Link 
            href="/preview/blueprint-plus"
            className="btn-secondary inline-flex"
          >
            See Blueprint+ Structure →
          </Link>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-brand-navy/10">
          <p className="bs-small text-brand-muted">
            Brand Blueprint™ by Wunderbar Digital
          </p>
        </footer>
      </div>
    </main>
  );
}
