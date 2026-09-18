import type { Metadata } from "next";
import Link from "next/link";
import "./blueprint-plus-landing.css";

export const metadata: Metadata = {
  title: "WunderBrand Blueprint+™ | Advanced Brand Strategy",
  description:
    "Advanced brand strategy built for long-term growth — implementation guides, templates, AI prompts, unlimited refreshes for the first year, and a Strategy Activation Session. $1,997.",
  openGraph: {
    title: "WunderBrand Blueprint+™ | Advanced Brand Strategy",
    description:
      "A living brand strategy with tools, guidance, and a live strategist session. $1,997.",
    url: "https://app.wunderbrand.ai/brand-blueprint-plus",
    images: [{ url: "/marketing/wunderbrand-snapshot-hero.jpg", alt: "WunderBrand Blueprint+™" }],
  },
};

const CHECKOUT = "/checkout/blueprint-plus";

const TALK =
  "https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=talk_expert&utm_content=blueprint_plus";
const FEATURES = "/brand-blueprint-plus/features";
const SCORE =
  "https://wunderbardigital.com/wunderbrand-score?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=blueprint_plus_score&utm_content=wunderbrand_score";
const FAQ =
  "https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=blueprint_plus_faq&utm_content=see_all_faqs";

const OVERVIEW = [
  {
    title: "Your WunderBrand Score™ & Diagnostics",
    desc: "A single score from our proprietary branding framework, a deep review across the five pillars, SWOT analysis, brand health scorecard — plus unlimited edits and refreshes for the first year to track progress over time.",
  },
  {
    title: "Detailed Analysis",
    desc: "See what each brand gap is costing you — in dollars, not abstractions — with 12-month impact scenarios, multi-channel fix examples, and step-by-step implementation templates.",
  },
  {
    title: "Brand Identity & Personality",
    desc: "Your brand's strategic core — purpose, promise, positioning, and differentiation. Plus a complete archetype system with activation guide, audience-specific communication guidelines, brand growth strategy, and terminology guide.",
  },
  {
    title: "Understanding Your Customers",
    desc: "Primary and secondary ICPs with demographics, psychographics, and buying triggers. Plus a full buyer persona ecosystem, audience gap analysis, transition plan, customer journey mapping, and persona-driven marketing segmentation.",
  },
  {
    title: "What to Say & Where to Say It",
    desc: "A complete messaging system — core messages with audience-specific variations, message map (audience × funnel × channel), campaign strategy with narrative arcs, brand story in six formats, and company descriptions for every professional context.",
  },
  {
    title: "Sales & Pricing Enablement",
    desc: "A value and pricing communication framework with persona-specific pricing narratives, plus a sales conversation guide with discovery questions, objection handling, and closing language tied to your messaging system.",
  },
  {
    title: "Visual Direction",
    desc: "Brand color palette with HEX, RGB, and CMYK values, typography direction, visual consistency rules, and a full visual and imagery direction guide — including AI image generation prompts.",
  },
  {
    title: "Competitive Intelligence & Strategy",
    desc: "Competitive positioning map with a 12-month movement plan, counter-positioning, gap analysis, vulnerability playbook, and strategic trade-offs with sequenced moves.",
  },
  {
    title: "Getting Found Online",
    desc: "SEO with 15+ keywords, AI search readiness roadmap, three complete email sequences, social media strategy with repurposing playbook, content calendar, and funnel-specific CTAs with ready-to-use copy.",
  },
  {
    title: "AI Prompt Packs",
    desc: "8 prompts for brand strategy, 8 for marketing execution, and 12 advanced prompts for competitive analysis, market expansion, and thought leadership — all pre-loaded with your brand.",
  },
  {
    title: "Interactive Brand Workbook",
    desc: "Your always-current brand workspace — structured pillar by pillar so your team can apply, update, and share your strategy as your business evolves.",
  },
  {
    title: "Your Action Plan",
    desc: "A 90-day week-by-week roadmap, brand consistency checklist with team onboarding, measurement and KPI framework with scorecard, and a brand strategy rollout guide with role-specific briefs and agency packets.",
  },
] as const;

export default function BrandBlueprintPlusPage() {
  return (
    <main className="bg-white font-brand">
      <section className="bp-hero">
        <div className="bp-hero-container">
          <div className="bp-hero-panel">
            <span className="bp-eyebrow">WunderBrand Blueprint+™</span>
            <h1 className="bp-h1">Advanced Brand Strategy — Built for Long-Term Growth</h1>
            <p className="bp-lead">
              WunderBrand Blueprint+™ expands your foundation into a deeper strategic system — designed for businesses that need precision, flexibility, and long-term alignment.
            </p>
            <div className="bp-hero-cta-group">
              <a href={TALK} className="bp-btn-primary" target="_blank" rel="noopener noreferrer">
                Talk to an Expert
              </a>
              <Link href={FEATURES} className="bp-btn-outline-white">
                See What&apos;s Inside
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="bp-body-segment">
        <section className="bp-intro-section">
          <div className="bp-intro-container">
            <p className="bp-intro-lead">
              A complete brand strategy that moves with your business — delivered in real time, updated as you grow.
            </p>
            <p className="bp-intro-text">
              WunderBrand Blueprint+™ isn&apos;t a document you receive once and file away. It&apos;s a living brand strategy — built on a proprietary five-pillar branding framework — that you work in, update throughout the year, and share with your team as your business evolves. Strategic analysis, implementation guides, ready-to-use templates, a full messaging system, brand-calibrated AI prompts, and a live strategy session with a brand strategist.
            </p>
            <p className="bp-intro-text">
              This isn&apos;t a set of results that tells you what&apos;s wrong. It&apos;s a system that shows you what to do, gives you the tools to do it, walks you through it with expert guidance — and stays current as your market, team, and strategy evolve.
            </p>
          </div>
        </section>

        <section className="body-blueprint-plus">
          <div className="bp-grid">
            <div className="bp-content">
              <h2 className="bp-h2">What Changes for Your Business</h2>
              <ul className="bp-checklist">
                <li>
                  <strong>Your positioning gets sharp.</strong> You&apos;ll know exactly what makes you different, how to say it, and how to make it stick — with a brand foundation, competitive positioning map with a 12-month movement plan, and strategic trade-offs. Includes thought leadership positioning and a credibility and trust signal strategy.
                </li>
                <li>
                  <strong>You know exactly who you&apos;re selling to.</strong> Primary and secondary ICPs with demographics, psychographics, buying triggers, objections, and customer language — enhanced with content topics, conversion paths, and a full buyer persona ecosystem with messaging guides for each audience.
                </li>
                <li>
                  <strong>Your messaging becomes a system.</strong> Core message, proof points, audience-specific variations, a message map (audience × funnel × channel), campaign strategy with narrative arcs, brand story in six formats including elevator pitch, and company descriptions.
                </li>
                <li>
                  <strong>You stop losing deals on price.</strong> A value and pricing communication framework with persona-specific pricing narratives and objection responses, plus a sales conversation guide with discovery questions, objection handling, closing language, and scenario scripts.
                </li>
                <li>
                  <strong>Your visual identity holds up everywhere.</strong> Color palette with exact codes, typography direction, visual consistency rules, and a full Visual Operating System — photography style, platform-specific imagery, persona-based guidance, and AI image prompts.
                </li>
                <li>
                  <strong>You get found — and chosen.</strong> SEO strategy with 15+ keywords, AI search readiness roadmap, three complete email sequences, social media strategy with repurposing playbook, content calendar, funnel-specific CTAs, and an AI Answer Engine (AEO) strategy.
                </li>
                <li>
                  <strong>AI works for your brand, not against it.</strong> Brand-calibrated AI prompts covering brand strategy, marketing execution, competitive analysis, market expansion, and thought leadership.
                </li>
                <li>
                  <strong>You have a workspace to put it all into practice.</strong> The Interactive Brand Workbook gives your team a structured, pillar-by-pillar workspace to apply your strategy.
                </li>
                <li>
                  <strong>You walk away with a plan, not a PDF.</strong> A 90-day week-by-week roadmap, brand strategy rollout guide with role-specific briefs and agency packets, measurement and KPI framework — plus a live strategy session to prioritize your first moves.
                </li>
              </ul>
              <p className="bp-checklist-footer">
                <Link href={FEATURES} className="bp-inline-link">
                  See the complete feature breakdown →
                </Link>
              </p>
            </div>

            <aside className="bp-side">
              <div className="bp-card bp-price-card">
                <span className="bp-tag bp-product-name">WunderBrand Blueprint+™</span>
                <span className="bp-tag">Investment</span>
                <div className="bp-price-value">$1,997</div>
                <Link href={CHECKOUT} className="bp-price-btn">
                  Get WunderBrand Blueprint+™
                </Link>
                <p className="bp-mid-cta-lockline" style={{ marginTop: 16, textAlign: "center" }}>
                  Includes unlimited edits and refreshes for the first year. Applies to one brand only — one company, one Blueprint+™.
                </p>
              </div>
              <div className="bp-card">
                <span className="bp-tag">Who This Is For</span>
                <ul className="bp-sidebar-list">
                  <li>Businesses that want implementation-ready strategy — not a document that gathers dust</li>
                  <li>Founders building a brand to sell, raise capital, or franchise</li>
                  <li>Companies managing multiple products, audiences, or market segments</li>
                  <li>Leaders who want to hand their team a single document covering every channel and scenario</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="bp-overview-section" id="bp-full-breakdown">
          <h2 className="bp-overview-heading">What&apos;s Inside</h2>
          <p className="bp-overview-cta-sub" style={{ textAlign: "left", fontStyle: "normal", marginBottom: 32, color: "#404040", fontSize: 16 }}>
            Everything you need across 12 strategic categories — built to be worked in, updated as you grow, and shared with your team. Not a deliverable. A living brand strategy.
          </p>
          <div className="bp-overview-grid">
            {OVERVIEW.map((item) => (
              <div key={item.title} className="bp-overview-card">
                <h3 className="bp-overview-card-title">{item.title}</h3>
                <p className="bp-overview-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bp-overview-cta">
            <Link href={CHECKOUT} className="bp-overview-buy-btn">
              Get WunderBrand Blueprint+™ — $1,997
            </Link>
            <Link href={FEATURES} className="bp-overview-cta-btn">
              See the Complete Feature Breakdown
            </Link>
            <p className="bp-overview-cta-sub">
              Every deliverable explained — what it is and what it does for your business.
            </p>
          </div>
          <div className="bp-compare-cta">
            <p className="bp-compare-cta-text">Want to see how all products compare side by side?</p>
            <Link href="/brand-suite#compare" className="bp-compare-cta-link">
              Compare All Products
            </Link>
          </div>
        </section>

        <section className="bp-process-section">
          <div className="bp-process-container">
            <h2 className="bp-process-heading">How It Works</h2>
            <p className="bp-process-intro">From purchase to action plan — here&apos;s what happens.</p>
            <div className="bp-process-horizontal">
              <div className="bp-process-step-card">
                <div className="bp-step-number" style={{ marginBottom: 16 }}>1</div>
                <h3 className="bp-step-title">Complete Your Brand Diagnostic</h3>
                <p className="bp-step-desc">
                  Answer a series of strategic questions about your business, brand, customers, and competitive landscape. Takes 25–35 minutes. Auto-save is built in — pause and return anytime.
                </p>
                <span className="bp-step-time">25–35 min</span>
              </div>
              <div className="bp-process-connector" aria-hidden />
              <div className="bp-process-step-card">
                <div className="bp-step-number" style={{ marginBottom: 16 }}>2</div>
                <h3 className="bp-step-title">Your Strategy Goes Live</h3>
                <p className="bp-step-desc">
                  Your complete WunderBrand Blueprint+™ is generated in real time. Open your Interactive Brand Workbook and start executing immediately.{" "}
                  <Link href={FEATURES} className="bp-inline-link">
                    See the complete feature breakdown →
                  </Link>
                </p>
                <span className="bp-step-time">Delivered instantly</span>
              </div>
              <div className="bp-process-connector" aria-hidden />
              <div className="bp-process-step-card">
                <div className="bp-step-number" style={{ marginBottom: 16 }}>3</div>
                <h3 className="bp-step-title">Book Your Strategy Session</h3>
                <p className="bp-step-desc">
                  After your results are delivered, you&apos;ll receive a scheduling link for your complimentary 30-minute Strategy Activation Session. We&apos;ll review your results, identify highest-impact opportunities, and build a prioritized action plan.
                </p>
                <span className="bp-step-time">Within 90 days</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bp-session-section">
          <span className="bp-session-eyebrow">Included with Every Purchase</span>
          <h2 className="bp-session-heading">Your Strategy Activation Session</h2>
          <p className="bp-session-intro">
            WunderBrand Blueprint+™ includes a live session with a brand strategist. This is 30 minutes of focused, one-on-one strategy — not a sales call.
          </p>
          <div className="bp-session-card">
            <div className="bp-session-content">
              <h3 className="bp-session-subtitle">What we cover:</h3>
              <ul className="bp-session-list">
                <li>Review your WunderBrand Blueprint+™ results and what they reveal about your brand</li>
                <li>Identify your highest-impact opportunities across all five pillars</li>
                <li>Prioritize your next 2–3 strategic moves based on your specific situation</li>
                <li>Build a focused 30-day action plan you can start executing immediately</li>
                <li>Answer any questions about your results, templates, or AI prompts</li>
              </ul>
            </div>
            <div className="bp-session-details">
              <div className="bp-session-detail-item">
                <span className="bp-session-detail-label">Duration</span>
                <span className="bp-session-detail-value">30 minutes</span>
              </div>
              <div className="bp-session-detail-item">
                <span className="bp-session-detail-label">Format</span>
                <span className="bp-session-detail-value">Video call</span>
              </div>
              <div className="bp-session-detail-item">
                <span className="bp-session-detail-label">Booking window</span>
                <span className="bp-session-detail-value">Within 90 days of delivery</span>
              </div>
              <div className="bp-session-detail-item">
                <span className="bp-session-detail-label">Prep required</span>
                <span className="bp-session-detail-value">Have your results open + your #1 question ready</span>
              </div>
              <div className="bp-session-detail-item">
                <span className="bp-session-detail-label">Follow-up</span>
                <span className="bp-session-detail-value">Recap email with prioritized next steps within 24 hours</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bp-mid-cta">
          <div className="bp-mid-cta-inner">
            <h2 className="bp-mid-cta-heading">
              Most brand strategies sit in a folder. This one lives in your business.
            </h2>
            <p className="bp-mid-cta-copy">
              WunderBrand Blueprint+™ gives you a complete brand platform you work in, update as your market shifts, and share with your team — with implementation guides, templates, AI prompts, and a live strategy session to get you moving from day one.
            </p>
            <div className="bp-mid-cta-buttons">
              <Link href={CHECKOUT} className="bp-btn-buy">
                Get WunderBrand Blueprint+™ — $1,997
              </Link>
            </div>
            <p style={{ marginBottom: 12 }}>
              <Link href={FEATURES} className="bp-inline-link">
                See everything that&apos;s included →
              </Link>
            </p>
            <p className="bp-mid-cta-lockline">
              Includes unlimited edits and refreshes for the first year. Applies to one brand only — one company, one Blueprint+™. Already purchased another Wunderbar Digital product? Your investment is credited automatically.
            </p>

            <div className="bp-explore-block">
              <h3 className="bp-explore-heading">Not ready to commit?</h3>
              <p className="bp-explore-copy">
                Start with the free{" "}
                <Link href="/brand-snapshot" className="bp-inline-link">
                  WunderBrand Snapshot™
                </Link>{" "}
                — 15–20 minutes, no credit card. Every dollar you invest in a previous product is credited toward your next one.
              </p>
              <div className="bp-mid-cta-buttons">
                <Link href="/brand-snapshot" className="bp-btn-secondary">
                  Start Free — No Credit Card
                </Link>
                <Link href="/brand-suite#compare" className="bp-btn-secondary">
                  Compare All Products
                </Link>
                <a href={TALK} className="bp-btn-secondary" target="_blank" rel="noopener noreferrer">
                  Talk to an Expert
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bp-faq">
          <span className="bp-eyebrow">Frequently Asked Questions</span>
          <h2 className="bp-faq-heading">Common questions about WunderBrand Blueprint+™</h2>
          <div>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">Do I need to do anything before purchasing?</summary>
              <div className="bp-faq-answer">
                <p>
                  No — WunderBrand Blueprint+™ is a complete, standalone product. No prior products, no prerequisites, no prep work required.{" "}
                  <Link href={FEATURES}>
                    See the complete feature breakdown →
                  </Link>
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">I&apos;ve already purchased another WunderBrand product. Does that credit apply here?</summary>
              <div className="bp-faq-answer">
                <p>
                  Yes — every dollar you&apos;ve already spent on any WunderBrand product is credited toward WunderBrand Blueprint+™. You&apos;ll never pay twice for the same ground.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">What is a WunderBrand Score™?</summary>
              <div className="bp-faq-answer">
                <p>
                  The{" "}
                  <a href={SCORE} target="_blank" rel="noopener noreferrer">
                    WunderBrand Score™
                  </a>{" "}
                  is a proprietary metric (0–100) that measures how well your brand&apos;s five strategic pillars work together as a system. It&apos;s included with every product in the{" "}
                  <Link href="/brand-suite">WunderBrand Suite™</Link>.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">How long does it take?</summary>
              <div className="bp-faq-answer">
                <p>
                  About 25–35 minutes. Auto-save is built in. After checkout, your results are generated in real time — typically in under a minute.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">When is the strategy session scheduled?</summary>
              <div className="bp-faq-answer">
                <p>
                  After your results are delivered, you&apos;ll receive a scheduling link. Sessions are typically held within 2 weeks of delivery. You have 90 days from delivery to book.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">What&apos;s the difference between WunderBrand Blueprint™ and WunderBrand Blueprint+™?</summary>
              <div className="bp-faq-answer">
                <p>
                  <Link href="/brand-blueprint">WunderBrand Blueprint™</Link> ($997) gives you a complete brand strategy with one complimentary refresh within 90 days. WunderBrand Blueprint+™ enhances every deliverable with implementation guides and templates, and adds exclusives: 90-day roadmap, full persona ecosystem, campaign strategy, Visual Operating System, advanced AI prompts, unlimited refreshes for the first year, and a Strategy Activation Session.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">What about WunderBrand Snapshot™ and WunderBrand Snapshot+™?</summary>
              <div className="bp-faq-answer">
                <p>
                  <Link href="/brand-snapshot">WunderBrand Snapshot™</Link> is free.{" "}
                  <Link href="/brand-snapshot/plus">WunderBrand Snapshot+™</Link> ($497) goes deeper. Every dollar you spend on either is credited toward Blueprint™ or Blueprint+™.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">Can I trust AI-generated brand strategy?</summary>
              <div className="bp-faq-answer">
                <p>
                  WunderBrand Blueprint+™ isn&apos;t AI guessing at your brand — it&apos;s a structured strategic methodology powered by AI. And with Blueprint+™, you also get a live session with a human strategist to review it together.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">Is my data confidential?</summary>
              <div className="bp-faq-answer">
                <p>
                  Yes. Your responses and results are confidential, used solely to generate your brand strategy, and never shared with third parties or used to train AI models.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">Can I retake my diagnostic and track my progress over time?</summary>
              <div className="bp-faq-answer">
                <p>
                  Yes — WunderBrand Blueprint+™ includes unlimited edits and refreshes for the first year at no extra cost. We recommend refreshing quarterly. Your original results are always available for comparison.
                </p>
              </div>
            </details>
            <details className="bp-faq-item">
              <summary className="bp-faq-question">How do I access my results later?</summary>
              <div className="bp-faq-answer">
                <p>
                  All results are saved to your dashboard. Your Interactive Brand Workbook is where you&apos;ll do most of your work. A full PDF is also available to download anytime.
                </p>
              </div>
            </details>
          </div>
          <p className="bp-faq-more">
            Have another question?{" "}
            <a href={FAQ} className="bp-faq-link" target="_blank" rel="noopener noreferrer">
              See all FAQs
            </a>{" "}
            or{" "}
            <a href={TALK} className="bp-faq-link" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
            .
          </p>
        </section>
      </div>

      <section className="bp-final-cta">
        <div className="bp-final-cta-inner">
          <h2 className="bp-final-heading">
            Your brand strategy — with the tools and guidance to execute it.
          </h2>
          <p className="bp-final-copy">
            Strategic analysis. Implementation guides. AI prompts. A live strategy session. Delivered in real time.
          </p>
          <div className="bp-mid-cta-buttons">
            <Link href={CHECKOUT} className="bp-btn-primary">
              Get WunderBrand Blueprint+™ — $1,997
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
