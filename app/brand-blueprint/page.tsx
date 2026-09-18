import type { Metadata } from "next";
import Link from "next/link";
import "./blueprint-landing.css";

export const metadata: Metadata = {
  title: "WunderBrand Blueprint™ | Complete Brand Strategy",
  description:
    "A complete brand strategy — positioning, messaging, competitive intelligence, buyer personas, visual direction, AI prompts, and a prioritized action plan. $997.",
  openGraph: {
    title: "WunderBrand Blueprint™ | Complete Brand Strategy",
    description:
      "Your brand — fully defined, ready to scale. $997. Snapshot+ credit applies.",
    url: "https://app.wunderbrand.ai/brand-blueprint",
    images: [{ url: "/marketing/wunderbrand-snapshot-hero.jpg", alt: "WunderBrand Blueprint™" }],
  },
};

const CHECKOUT = "/checkout/blueprint";

const TALK =
  "https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=talk_expert&utm_content=blueprint";
const FEATURES = "/brand-blueprint/features";
const SCORE =
  "https://wunderbardigital.com/wunderbrand-score?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=blueprint_score&utm_content=wunderbrand_score";
const FAQ =
  "https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=blueprint_faq&utm_content=see_all_faqs";

const OVERVIEW = [
  {
    title: "Your WunderBrand Score™ & Diagnostics",
    desc: "A single score from our proprietary branding framework, a deep review across the five pillars that make a strong brand, executive summary with industry context, priority diagnosis, SWOT analysis, brand health scorecard, and a system-level view of how your brand pillars work together.",
  },
  {
    title: "Brand Identity & Personality",
    desc: "Your brand's strategic core — purpose, promise, positioning statement, brand values, and differentiation narrative. Plus a complete archetype system, persona profile, voice and tone guide, and activation guide so your brand has a consistent personality everywhere it shows up.",
  },
  {
    title: "Understanding Your Customers",
    desc: "Primary and secondary ideal customer profiles (ICPs) with demographics, psychographics, buying triggers, and the language your customers actually use. Plus buyer personas, audience gap analysis, transition plan, and a 6-stage customer journey map.",
  },
  {
    title: "Messaging & Content Strategy",
    desc: "A complete messaging system your team can use — core message, proof points, channel-specific copy, content pillars, taglines, a brand story with elevator pitch, and company descriptions ready to copy and paste.",
  },
  {
    title: "Sales & Pricing Enablement",
    desc: "Stop losing deals on price. A value and pricing communication framework with objection responses tied to your proof points, plus a sales conversation guide with discovery questions, objection handling, and closing language.",
  },
  {
    title: "Visual Direction",
    desc: "Brand color palette with HEX, RGB, and CMYK values, typography direction, visual consistency rules, and an imagery and photography direction guide — photography style, subject matter guidance, stock photo criteria, and color application in imagery.",
  },
  {
    title: "Competitive Intelligence & Strategy",
    desc: "See exactly where you sit in your market — a two-axis competitive positioning map with strategic whitespace and vulnerability analysis, a competitive gaps and vulnerability playbook, where to focus and why, and strategic trade-offs so you make choices on purpose, not by default.",
  },
  {
    title: "Getting Found Online",
    desc: "A complete digital visibility plan — SEO keywords, AI search readiness, credibility and trust signal strategy, email marketing framework with a welcome sequence, social media strategy with example posts, and a conversion strategy that turns visitors into buyers.",
  },
  {
    title: "AI Prompt Packs",
    desc: "Use AI without losing your brand voice. 8 prompts for brand strategy, 8 for marketing execution — blog posts, email, social, campaigns, sales scripts, and lead magnets that sound like you, not like AI.",
  },
  {
    title: "Interactive Brand Workbook",
    desc: "A structured, pillar-by-pillar workspace to apply your strategy — organized so it's ready to share with your team, agency, or investors from day one. Puts your Blueprint into practice without starting from scratch.",
  },
  {
    title: "Your Action Plan",
    desc: "No ambiguity about what to do next. Immediate clarity actions, five prioritized strategic actions, a brand consistency checklist, a rollout guide for getting your team aligned, and KPIs within each section so you know what to measure.",
  },
] as const;

export default function BrandBlueprintPage() {
  return (
    <main className="bg-white font-brand">
      <section className="bb-hero">
        <div className="bb-hero-container">
          <div className="bb-hero-panel">
            <span className="bb-eyebrow">WunderBrand Blueprint™</span>
            <h1 className="bb-h1">Your Brand — Fully Defined, Ready to Scale</h1>
            <p className="bb-lead">
              WunderBrand Blueprint™ delivers a complete, documented brand foundation — giving you clarity, consistency, and direction across every channel.
            </p>
            <div className="bb-hero-cta-group">
              <a href={TALK} className="bb-btn-primary" target="_blank" rel="noopener noreferrer">
                Talk to an Expert
              </a>
              <Link href={FEATURES} className="bb-btn-outline-white">
                See What&apos;s Inside
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="bb-body-segment">
        <section className="bb-intro-section">
          <div className="bb-intro-container">
            <p className="bb-intro-lead">
              A complete brand strategy — from positioning and messaging to competitive intelligence and a prioritized action plan — delivered in real time.
            </p>
            <p className="bb-intro-text">
              WunderBrand Blueprint™ is a full strategic analysis built on a proprietary five-pillar branding framework. It gives you a complete brand platform — positioning, messaging, buyer personas, content strategy, competitive positioning map, visual direction, sales enablement, brand-calibrated AI prompts, and a prioritized strategic action plan. Everything you need to build a brand that looks, sounds, and performs like it was built by a team of strategists.
            </p>
            <p className="bb-intro-text">
              This isn&apos;t a report that tells you what&apos;s wrong. It&apos;s a strategy that shows you what to do — across every pillar, channel, and audience.
            </p>
          </div>
        </section>

        <section className="body-brand-blueprint">
          <div className="bb-grid">
            <div className="bb-content">
              <h2 className="bb-h2">What Changes for Your Business</h2>
              <ul className="bb-checklist">
                <li>
                  <strong>Your positioning gets sharp.</strong> You&apos;ll know exactly what makes you different, how to say it, and how to make it stick — with a brand foundation, positioning statement, and a competitive positioning map showing exactly where you can win.
                </li>
                <li>
                  <strong>You know exactly who you&apos;re selling to.</strong> Primary and secondary ideal customer profiles (ICPs) with demographics, psychographics, buying triggers, objections, and the exact language your customers use — plus detailed buyer personas and a six-stage customer journey map so you know what matters at every stage.
                </li>
                <li>
                  <strong>Your messaging becomes a system.</strong> Core message, supporting messages, proof points, messaging pillars with channel-specific copy, a brand story with elevator pitch, taglines, and company descriptions — so your team stops writing from scratch and starts speaking with one voice.
                </li>
                <li>
                  <strong>You stop losing deals on price.</strong> A value and pricing communication framework with objection responses tied to your proof points, plus a sales conversation guide with discovery questions, objection handling, and closing language — so your sales conversations match your brand strategy.
                </li>
                <li>
                  <strong>Your visual identity holds up everywhere.</strong> Color palette with exact HEX, RGB, and CMYK values, typography direction, visual consistency rules, and an imagery direction guide — so every touchpoint looks intentional, even when different people create the assets.
                </li>
                <li>
                  <strong>You get found — and trusted.</strong> A visibility and discovery strategy, AI search readiness plan, SEO keyword strategy, email marketing framework, social media platform strategy with example posts, and a conversion strategy that maps trust-building across your entire brand experience.
                </li>
                <li>
                  <strong>AI works for your brand, not against it.</strong> Brand-calibrated AI prompts pre-loaded with your positioning, voice, and audience — for brand strategy and marketing execution — so every output sounds like you, not like a template.
                </li>
                <li>
                  <strong>You have a workspace to put it all into practice.</strong> The Interactive Brand Workbook gives your team a structured, pillar-by-pillar workspace to apply your strategy — organized so it&apos;s ready to share with your team, agency, or investors from day one.
                </li>
                <li>
                  <strong>You walk away with a plan — and the tools to execute it.</strong> Immediate clarity actions, five prioritized strategic actions, a brand consistency checklist, a rollout guide for getting your team aligned, and KPIs within each section so you know what to measure and when to course-correct.
                </li>
              </ul>
              <p className="bb-checklist-footer">
                <Link href={FEATURES} className="bb-inline-link">
                  See the complete feature breakdown →
                </Link>
              </p>
            </div>

            <aside className="bb-side">
              <div className="bb-card bb-price-card">
                <span className="bb-tag bb-product-name">WunderBrand Blueprint™</span>
                <span className="bb-tag">Investment</span>
                <div className="bb-price-value">$997</div>
                <Link href={CHECKOUT} className="bb-price-btn">
                  Get WunderBrand Blueprint™
                </Link>
                <p className="bb-mid-cta-lockline" style={{ marginTop: 16, textAlign: "center" }}>
                  Includes one complimentary refresh within 90 days of delivery. Applies to one brand only — one company, one Blueprint.
                </p>
              </div>
              <div className="bb-card">
                <span className="bb-tag">Who This Is For</span>
                <ul className="bb-sidebar-list">
                  <li>Businesses ready for a complete brand strategy they can execute internally</li>
                  <li>Founders who need positioning, messaging, and competitive clarity in one document</li>
                  <li>Teams that want to move beyond diagnostics and into strategic planning</li>
                  <li>Companies that know what&apos;s broken and want a clear, prioritized plan to fix it</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="bb-overview-section" id="bb-full-breakdown">
          <p className="bb-overview-eyebrow">What&apos;s Inside</p>
          <h3 className="bb-overview-heading">
            A complete brand strategy across 11 categories — built on a proprietary five-pillar branding framework.
          </h3>
          <div className="bb-overview-grid">
            {OVERVIEW.map((item) => (
              <div key={item.title} className="bb-overview-card">
                <h4 className="bb-overview-card-title">{item.title}</h4>
                <p className="bb-overview-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bb-overview-cta">
            <Link href={CHECKOUT} className="bb-overview-buy-btn">
              Get WunderBrand Blueprint™ — $997
            </Link>
            <Link href={FEATURES} className="bb-overview-cta-btn">
              See the Complete Feature Breakdown
            </Link>
            <p className="bb-overview-cta-sub">
              Every deliverable explained — what it is and what it does for your business.
            </p>
          </div>
          <div className="bb-compare-cta">
            <p className="bb-compare-cta-text">Want to see how all products compare side by side?</p>
            <Link href="/brand-suite#compare" className="bb-compare-cta-link">
              Compare All Products
            </Link>
          </div>
        </section>

        <section className="bb-process-section">
          <div className="bb-process-container">
            <h2 className="bb-process-heading">How It Works</h2>
            <p className="bb-process-intro">From purchase to action plan — here&apos;s what happens.</p>
            <div className="bb-process-steps">
              <div className="bb-process-step">
                <div className="bb-step-number">1</div>
                <h3 className="bb-step-title">Complete Your Brand Diagnostic</h3>
                <p className="bb-step-desc">
                  Answer a focused set of questions about your business, audience, competitors, and goals. The diagnostic takes about 20–25 minutes and covers all five brand pillars — positioning, messaging, visibility, credibility, and conversion.
                </p>
              </div>
              <div className="bb-process-step">
                <div className="bb-step-number">2</div>
                <h3 className="bb-step-title">Your WunderBrand Blueprint™ Is Generated</h3>
                <p className="bb-step-desc">
                  Our AI-powered diagnostic engine analyzes your inputs against proven brand strategy frameworks. Your complete results — including strategic analysis, brand platform, competitive intelligence, and brand-calibrated AI prompts — are delivered in real time.{" "}
                  <Link href={FEATURES} className="bb-inline-link">
                    See the complete feature breakdown →
                  </Link>
                </p>
              </div>
              <div className="bb-process-step">
                <div className="bb-step-number">3</div>
                <h3 className="bb-step-title">Start Executing with Clarity</h3>
                <p className="bb-step-desc">
                  Open your results and start with the strategic action plan. Every recommendation is prioritized and specific — no guessing about what to do first. Use the Interactive Brand Workbook to apply your strategy pillar by pillar, the AI prompts to generate on-brand content, and the brand consistency checklist to keep everything aligned as you roll it out.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-mid-cta">
          <div className="bb-mid-cta-inner">
            <h2 className="bb-mid-cta-heading">
              Most brands don&apos;t have a strategy problem — they have a clarity problem. This fixes that.
            </h2>
            <p className="bb-mid-cta-copy">
              WunderBrand Blueprint™ gives you a complete brand platform — positioning, messaging, competitive intelligence, buyer personas, visual direction, AI prompts, and a prioritized action plan — so every decision your team makes is pulling in the same direction. Not someday. Starting today.
            </p>
            <div className="bb-mid-cta-buttons">
              <Link href={CHECKOUT} className="bb-btn-buy">
                Get WunderBrand Blueprint™ — $997
              </Link>
            </div>
            <p style={{ marginBottom: 12 }}>
              <Link href={FEATURES} className="bb-inline-link">
                See everything that&apos;s included →
              </Link>
            </p>
            <p className="bb-mid-cta-lockline">
              Includes one complimentary refresh within 90 days of delivery. Applies to one brand only — one company, one Blueprint. Already purchased another Wunderbar Digital product? Your investment is credited automatically. Your responses are confidential and never shared with third parties.
            </p>

            <div className="bb-explore-block">
              <h3 className="bb-explore-heading">Not ready to commit?</h3>
              <p className="bb-explore-copy">
                Start with the free{" "}
                <Link href="/brand-snapshot" className="bb-inline-link">
                  WunderBrand Snapshot™
                </Link>{" "}
                — 15–20 minutes, no credit card, and you&apos;ll walk away with a WunderBrand Score™ and a clear view of where to focus first. Every dollar you invest in a previous product is credited toward your next one.
              </p>
              <div className="bb-mid-cta-buttons">
                <Link href="/brand-snapshot" className="bb-btn-secondary">
                  Start Free — No Credit Card
                </Link>
                <Link href="/brand-suite#compare" className="bb-btn-secondary">
                  Compare All Products
                </Link>
                <a href={TALK} className="bb-btn-secondary" target="_blank" rel="noopener noreferrer">
                  Talk to an Expert
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-faq">
          <span className="bb-eyebrow">Frequently Asked Questions</span>
          <h2 className="bb-faq-heading">Common questions about WunderBrand Blueprint™</h2>
          <div>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">Do I need to do anything before purchasing?</summary>
              <div className="bb-faq-answer">
                <p>
                  No — WunderBrand Blueprint™ is a complete, standalone brand strategy. It includes a full diagnostic, brand platform, competitive intelligence, buyer personas, content strategy, AI prompts, and a prioritized action plan. No prior products, no prerequisites, no prep work required.{" "}
                  <Link href={FEATURES}>
                    See the complete feature breakdown →
                  </Link>
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">I&apos;ve already purchased another WunderBrand product. Does that credit apply here?</summary>
              <div className="bb-faq-answer">
                <p>
                  Yes — every dollar you&apos;ve already spent on any WunderBrand product is credited toward WunderBrand Blueprint™. You&apos;ll never pay twice for the same ground.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">What is a WunderBrand Score™?</summary>
              <div className="bb-faq-answer">
                <p>
                  The{" "}
                  <a href={SCORE} target="_blank" rel="noopener noreferrer">
                    WunderBrand Score™
                  </a>{" "}
                  is a proprietary metric (0–100) that measures how well your brand&apos;s five strategic pillars — positioning, messaging, visibility, credibility, and conversion — work together as a system. It&apos;s included with every product in the{" "}
                  <Link href="/brand-suite">WunderBrand Suite™</Link>, and it&apos;s the diagnostic foundation that everything else builds on.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">How long does it take?</summary>
              <div className="bb-faq-answer">
                <p>
                  About 20–25 minutes. Auto-save is built in, so you can pause and return anytime. After checkout, your results are generated in real time — typically in under a minute.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">What&apos;s the difference between WunderBrand Blueprint™ and WunderBrand Blueprint+™?</summary>
              <div className="bb-faq-answer">
                <p>
                  WunderBrand Blueprint™ gives you a complete brand strategy — positioning, messaging system, buyer personas, competitive positioning map, content strategy, sales enablement, visual direction, AI prompts, Interactive Brand Workbook, SWOT analysis, brand health scorecard, and a prioritized action plan. It also includes one complimentary refresh within the first 90 days of delivery.
                </p>
                <p>
                  <Link href="/brand-blueprint-plus">WunderBrand Blueprint+™</Link> enhances every Blueprint™ deliverable with implementation guides and templates, and adds Blueprint+™ exclusives including a 90-day roadmap, full persona ecosystem, campaign strategy, Visual Operating System, advanced AI prompt library, unlimited refreshes for the first year, and a complimentary Strategy Activation Session.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">What about WunderBrand Snapshot™ and WunderBrand Snapshot+™?</summary>
              <div className="bb-faq-answer">
                <p>
                  <Link href="/brand-snapshot">WunderBrand Snapshot™</Link> is a free diagnostic that gives you a{" "}
                  <a href={SCORE} target="_blank" rel="noopener noreferrer">
                    WunderBrand Score™
                  </a>
                  , five-pillar analysis, archetype profile, and three immediate next steps.{" "}
                  <Link href="/brand-snapshot/plus">WunderBrand Snapshot+™</Link> ($497) goes deeper with pillar-by-pillar analysis, voice and tone, ICP, visual direction, AI prompts, and a prioritized action plan. Both are standalone products, and every dollar you spend on either is credited toward WunderBrand Blueprint™.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">Can I trust AI-generated brand strategy?</summary>
              <div className="bb-faq-answer">
                <p>
                  WunderBrand Blueprint™ isn&apos;t AI guessing at your brand — it&apos;s a structured strategic methodology powered by AI. It&apos;s built on proven brand strategy frameworks across positioning, messaging, visibility, credibility, and conversion.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">Is my data confidential?</summary>
              <div className="bb-faq-answer">
                <p>
                  Yes. Your responses and results are confidential, used solely to generate your brand strategy, and never shared with third parties or used to train AI models.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">Can I retake my diagnostic and track my progress over time?</summary>
              <div className="bb-faq-answer">
                <p>
                  Yes — WunderBrand Blueprint™ includes one complimentary refresh within the first 90 days of delivery. After that, refreshes are $97 each. We recommend refreshing quarterly. Your original results are always available for comparison.
                </p>
              </div>
            </details>
            <details className="bb-faq-item">
              <summary className="bb-faq-question">How do I access my results later?</summary>
              <div className="bb-faq-answer">
                <p>
                  All results are saved to your dashboard and accessible from any device via the link we email you after delivery. Your Interactive Brand Workbook is where you&apos;ll do most of your work. A full PDF is also available to download anytime.
                </p>
              </div>
            </details>
          </div>
          <p className="bb-faq-more">
            Have another question?{" "}
            <a href={FAQ} className="bb-faq-link" target="_blank" rel="noopener noreferrer">
              See all FAQs
            </a>{" "}
            or{" "}
            <a href={TALK} className="bb-faq-link" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
            .
          </p>
        </section>
      </div>

      <section className="bb-final-cta">
        <div className="bb-final-cta-inner">
          <h2 className="bb-final-heading">
            Your complete brand strategy — positioning, messaging, and a 90-day plan to execute it.
          </h2>
          <p className="bb-final-copy">
            Strategic analysis. 16 AI prompts. Competitive intelligence. Delivered in real time.
          </p>
          <div className="bb-mid-cta-buttons">
            <Link href={CHECKOUT} className="bb-btn-primary">
              Get WunderBrand Blueprint™ — $997
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
