import type { Metadata } from "next";
import Link from "next/link";
import "./snapshot-plus-landing.css";

export const metadata: Metadata = {
  title: "WunderBrand Snapshot+™ | Strategic Brand Deep Dive",
  description:
    "A strategic brand deep dive personalized to your business — pillar-by-pillar analysis, communication guidelines, ICP, visual direction, AI prompts, and a 90-day action plan. $497.",
  openGraph: {
    title: "WunderBrand Snapshot+™ | Strategic Brand Deep Dive",
    description:
      "Transform your high-level results into a detailed strategic analysis — $497. Upgrade credit applies to Blueprint™.",
    url: "https://app.wunderbrand.ai/brand-snapshot/plus",
    images: [{ url: "/marketing/wunderbrand-snapshot-hero.jpg", alt: "WunderBrand Snapshot+™" }],
  },
};

const CHECKOUT = "/checkout/snapshot-plus";

const TALK =
  "https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=talk_expert&utm_content=snapshot_plus";
const FEATURES = "/brand-snapshot/plus/features";
const SCORE =
  "https://wunderbardigital.com/wunderbrand-score?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=snapshot_plus_score&utm_content=wunderbrand_score";
const FAQ =
  "https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=snapshot_plus_faq&utm_content=see_all_faqs";

const OVERVIEW = [
  {
    title: "Your WunderBrand Score™",
    desc: "A WunderBrand Score™ (0–100) with five-pillar analysis, per-pillar insights, AI-informed industry context, and a clear view of where to focus first.",
  },
  {
    title: "Detailed Analysis",
    desc: "Pillar-by-pillar analysis showing how each gap affects your business, what happens if you don't act, and before-and-after examples so you can see the difference fixes make.",
  },
  {
    title: "Brand Identity & Personality",
    desc: "A brand personality profile with core and supporting types, plus communication guidelines that give your team a clear foundation for how your brand should sound.",
  },
  {
    title: "Understanding Your Customers",
    desc: "An ideal customer profile with demographics, psychographics, and buying triggers — so you know exactly who your best customers are and what drives their decisions.",
  },
  {
    title: "What to Say & Where to Say It",
    desc: "Three core messaging pillars, a content strategy, tagline recommendations, and five prioritized strategic actions — your messaging foundation in one place.",
  },
  {
    title: "Visual Direction",
    desc: "A brand color palette with exact HEX, RGB, and CMYK values — so your visual identity is consistent across digital, print, and every touchpoint in between.",
  },
  {
    title: "Getting Found Online",
    desc: "A visibility and discovery strategy paired with AI search readiness guidance — so your brand shows up where your customers are already looking.",
  },
  {
    title: "AI Prompt Packs",
    desc: "Brand-calibrated AI prompts for brand strategy — pre-loaded with your positioning, voice, and audience so every output sounds like you, not like a template.",
  },
  {
    title: "Your Action Plan",
    desc: "A 90-day action plan with five prioritized strategic actions and a brand do's and don'ts guide — so you know exactly what to do first and how to stay on track.",
  },
] as const;

export default function BrandSnapshotPlusPage() {
  return (
    <main className="bg-white font-brand">
      {/* Hero */}
      <section className="sp-hero">
        <div className="sp-hero-container">
          <div className="sp-hero-panel">
            <span className="sp-eyebrow">WunderBrand Snapshot+™</span>
            <h1 className="sp-h1">A Strategic Brand Deep Dive — Personalized to Your Business</h1>
            <p className="sp-lead">
              WunderBrand Snapshot+™ transforms your high-level results into a detailed, strategic analysis — connecting the dots between what&apos;s happening now and what needs to change next.
            </p>
            <div className="sp-hero-cta-group">
              <a href={TALK} className="sp-btn-primary" target="_blank" rel="noopener noreferrer">
                Talk to an Expert
              </a>
              <Link href={FEATURES} className="sp-btn-outline-white">
                See What&apos;s Inside
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="sp-body-segment">
        {/* Intro */}
        <section className="sp-intro-section">
          <div className="sp-intro-container">
            <p className="sp-intro-lead">
              Your brand&apos;s blind spots — surfaced, analyzed, and paired with a clear plan to fix them.
            </p>
            <p className="sp-intro-text">
              WunderBrand Snapshot+™ is a strategic diagnostic built on a proprietary five-pillar branding framework. It goes beyond your WunderBrand Score™ to show you exactly how each gap affects your business — with pillar-by-pillar analysis, communication guidelines, an ideal customer profile, a brand color palette, brand-calibrated AI prompts, and a 90-day action plan. Everything you need to move from awareness to action.
            </p>
            <p className="sp-intro-text">
              This isn&apos;t a summary of what&apos;s wrong. It&apos;s a diagnosis that shows you what to do about it — with the context and direction to start making changes now.
            </p>
          </div>
        </section>

        {/* What changes + sidebar */}
        <section className="body-brand-snapshot-plus">
          <div className="sp-grid">
            <div className="sp-content">
              <h2 className="sp-h2">What Changes for Your Business</h2>
              <ul className="sp-checklist">
                <li>
                  <strong>You&apos;ll know exactly where your brand stands.</strong> A WunderBrand Score™ across five strategic pillars — positioning, messaging, visibility, credibility, and conversion — with AI-informed industry context so your numbers mean something.
                </li>
                <li>
                  <strong>You&apos;ll see what each gap is costing you.</strong> Pillar-by-pillar analysis that connects brand gaps to business outcomes — how each one affects revenue, trust, and growth — with before-and-after examples so you can see the difference fixes make.
                </li>
                <li>
                  <strong>You&apos;ll find your brand&apos;s voice.</strong> A brand personality profile with core and supporting types, plus communication guidelines that give your team a clear foundation for how your brand should sound across every channel.
                </li>
                <li>
                  <strong>You&apos;ll know who to talk to and what to say.</strong> An ideal customer profile, three core messaging pillars, tagline recommendations, and a content strategy — so you stop guessing and start speaking directly to the people most likely to buy.
                </li>
                <li>
                  <strong>You&apos;ll start getting found.</strong> A visibility and discovery strategy paired with AI search readiness guidance — plus a brand color palette with exact HEX, RGB, and CMYK values so your visual identity is ready to go.
                </li>
                <li>
                  <strong>AI works for your brand, not against it.</strong> Brand-calibrated AI prompts pre-loaded with your positioning, voice, and audience — so every output sounds like your brand, not a generic template.
                </li>
                <li>
                  <strong>You walk away with a plan.</strong> A 90-day action plan with five prioritized strategic actions, plus a brand do&apos;s and don&apos;ts guide — so you know exactly what to do first, second, and third.
                </li>
              </ul>
              <p className="sp-checklist-footer">
                <Link href={FEATURES} className="sp-inline-link">
                  See the complete feature breakdown →
                </Link>
              </p>
            </div>

            <aside className="sp-side">
              <div className="sp-card sp-price-card">
                <span className="sp-tag sp-product-name">WunderBrand Snapshot+™</span>
                <span className="sp-tag">Investment</span>
                <div className="sp-price-value">$497</div>
                <Link href={CHECKOUT} className="sp-price-btn">
                  Get WunderBrand Snapshot+™
                </Link>
              </div>
              <div className="sp-card">
                <span className="sp-tag">Who This Is For</span>
                <ul className="sp-sidebar-list">
                  <li>Businesses that know something&apos;s off but aren&apos;t sure where to start</li>
                  <li>Founders who want more than a score — they want a plan they can act on</li>
                  <li>Teams that need clear communication guidelines and brand direction</li>
                  <li>Companies ready to fix gaps before they become expensive problems</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        {/* Overview grid */}
        <section className="sp-overview-section">
          <p className="sp-overview-eyebrow">What&apos;s Inside</p>
          <h3 className="sp-overview-heading">
            A strategic diagnostic across 9 categories — built on a proprietary five-pillar branding framework.
          </h3>
          <div className="sp-overview-grid">
            {OVERVIEW.map((item) => (
              <div key={item.title} className="sp-overview-card">
                <h4 className="sp-overview-card-title">{item.title}</h4>
                <p className="sp-overview-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="sp-overview-cta">
            <Link href={CHECKOUT} className="sp-overview-buy-btn">
              Get WunderBrand Snapshot+™ — $497
            </Link>
            <Link href={FEATURES} className="sp-overview-cta-btn">
              See the Complete Feature Breakdown
            </Link>
            <p className="sp-overview-cta-sub">
              Every deliverable explained — what it is and what it does for your business.
            </p>
          </div>
          <div className="sp-compare-cta">
            <p className="sp-compare-cta-text">Want to see how all products compare side by side?</p>
            <Link href="/brand-suite#compare" className="sp-compare-cta-link">
              Compare All Products
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="sp-process-section">
          <div className="sp-process-container">
            <h2 className="sp-process-heading">How It Works</h2>
            <p className="sp-process-intro">From first question to actionable score — here&apos;s what happens.</p>
            <div className="sp-process-steps">
              <div className="sp-process-step">
                <div className="sp-step-number">1</div>
                <h3 className="sp-step-title">Answer Questions About Your Brand</h3>
                <p className="sp-step-desc">
                  You&apos;ll complete a focused diagnostic covering your business, audience, competitors, and goals. It takes about 15–20 minutes — no prep needed, no credit card required. Your responses are confidential and never shared with third parties.
                </p>
              </div>
              <div className="sp-process-step">
                <div className="sp-step-number">2</div>
                <h3 className="sp-step-title">Your WunderBrand Score™ Is Calculated</h3>
                <p className="sp-step-desc">
                  Our proprietary diagnostic engine analyzes your responses across all five pillars — positioning, messaging, visibility, credibility, and conversion — and generates a single score (0–100) with per-pillar insights. Results are delivered in real time.
                </p>
              </div>
              <div className="sp-process-step">
                <div className="sp-step-number">3</div>
                <h3 className="sp-step-title">See Exactly Where to Focus</h3>
                <p className="sp-step-desc">
                  Your score comes with a pillar-by-pillar breakdown showing where your brand is aligned and where it&apos;s not — plus prioritized next steps so you know what to act on first. From there, you can take action on your own or go deeper with a paid product in the{" "}
                  <Link href="/brand-suite" className="sp-inline-link">
                    WunderBrand Suite™
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid CTA */}
        <section className="sp-mid-cta">
          <div className="sp-mid-cta-inner">
            <h2 className="sp-mid-cta-heading">
              Your brand is making an impression right now — the question is whether it&apos;s the right one.
            </h2>
            <p className="sp-mid-cta-copy">
              WunderBrand Snapshot+™ shows you exactly where the gaps are, what they&apos;re costing you, and what to do about it — with the analysis, guidelines, and tools to start making changes immediately. Not someday. This week.
            </p>
            <div className="sp-mid-cta-buttons">
              <Link href={CHECKOUT} className="sp-btn-buy">
                Get WunderBrand Snapshot+™ — $497
              </Link>
            </div>
            <p className="sp-cta-features-link" style={{ marginBottom: 12 }}>
              <Link href={FEATURES} className="sp-inline-link">
                See everything that&apos;s included →
              </Link>
            </p>
            <p className="sp-mid-cta-lockline">
              Already purchased another Wunderbar Digital product? Your investment is credited automatically. Your responses are confidential and never shared with third parties.
            </p>

            <div className="sp-explore-block">
              <h3 className="sp-explore-heading">Not ready to commit?</h3>
              <p className="sp-explore-copy">
                Start with the free{" "}
                <Link href="/brand-snapshot" className="sp-inline-link">
                  WunderBrand Snapshot™
                </Link>{" "}
                — 15–20 minutes, no credit card, and you&apos;ll walk away with a WunderBrand Score™ and a clear view of where to focus first. Every dollar you invest in a previous product is credited toward your next one.
              </p>
              <div className="sp-mid-cta-buttons">
                <Link href="/brand-snapshot" className="sp-btn-secondary">
                  Start Free — No Credit Card
                </Link>
                <Link href="/brand-suite#compare" className="sp-btn-secondary">
                  Compare All Products
                </Link>
                <a href={TALK} className="sp-btn-secondary" target="_blank" rel="noopener noreferrer">
                  Talk to an Expert
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sp-faq">
          <span className="sp-eyebrow">Frequently Asked Questions</span>
          <h2 className="sp-faq-heading">Common questions about WunderBrand Snapshot+™</h2>
          <div>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">Do I need to do anything before purchasing?</summary>
              <div className="sp-faq-answer">
                <p>
                  No — WunderBrand Snapshot+™ is a complete, standalone diagnostic. It includes a WunderBrand Score™, five-pillar analysis, pillar-by-pillar deep dive, a voice and tone guide, communication guidelines, ideal customer profile, visual direction, AI prompts, and a prioritized action plan. No prior products, no prerequisites, no prep work required.{" "}
                  <Link href={FEATURES}>
                    See the complete feature breakdown →
                  </Link>
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">What is a WunderBrand Score™?</summary>
              <div className="sp-faq-answer">
                <p>
                  The{" "}
                  <a href={SCORE} target="_blank" rel="noopener noreferrer">
                    WunderBrand Score™
                  </a>{" "}
                  is a proprietary metric (0–100) that measures how well your brand&apos;s five strategic pillars — positioning, messaging, visibility, credibility, and conversion — work together. It&apos;s not just a number — it comes with per-pillar insights and industry context so you can see exactly where your brand is aligned and where gaps are creating friction. Every product in the{" "}
                  <Link href="/brand-suite">WunderBrand Suite™</Link> starts with your WunderBrand Score™.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">How long does it take?</summary>
              <div className="sp-faq-answer">
                <p>
                  About 15–20 minutes. Auto-save is built in, so you can pause and return anytime. After checkout, your results are generated in real time — typically in under a minute.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">What&apos;s the difference between WunderBrand Snapshot™ and WunderBrand Snapshot+™?</summary>
              <div className="sp-faq-answer">
                <p>
                  <Link href="/brand-snapshot">WunderBrand Snapshot™</Link> (free) shows you where your brand stands — you get a WunderBrand Score™, five-pillar analysis, archetype profile, and three immediate next steps. WunderBrand Snapshot+™ goes deeper with pillar-by-pillar analysis, a voice and tone guide, communication guidelines, an ideal customer profile, visual direction, AI prompts, tagline recommendations, and a prioritized action plan. Both are standalone products, and every dollar you spend on WunderBrand Snapshot+™ is credited toward{" "}
                  <Link href="/brand-blueprint">WunderBrand Blueprint™</Link> or{" "}
                  <Link href="/brand-blueprint-plus">WunderBrand Blueprint+™</Link>.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">What&apos;s the difference between WunderBrand Snapshot+™ and WunderBrand Blueprint™?</summary>
              <div className="sp-faq-answer">
                <p>
                  WunderBrand Snapshot+™ ($497) is a strategic diagnostic — it shows you what&apos;s working, what&apos;s not, and gives you a plan to start fixing it.{" "}
                  <Link href="/brand-blueprint">WunderBrand Blueprint™</Link> ($997) is a complete brand strategy — full positioning, messaging system, buyer personas, competitive positioning map, content strategy, sales enablement, visual direction, and a prioritized action plan. WunderBrand Snapshot+™ tells you what to fix. WunderBrand Blueprint™ tells you how to build. And your $497 is credited toward WunderBrand Blueprint™ if you decide to go further.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">Can I trust AI-generated brand analysis?</summary>
              <div className="sp-faq-answer">
                <p>
                  WunderBrand Snapshot+™ isn&apos;t AI guessing at your brand — it&apos;s a structured strategic methodology powered by AI. It&apos;s built on proven brand strategy frameworks across positioning, messaging, visibility, credibility, and conversion. The AI analyzes your specific inputs against these frameworks to surface patterns and opportunities a strategist would look for, delivered faster and at a fraction of the cost.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">Is my data confidential?</summary>
              <div className="sp-faq-answer">
                <p>
                  Yes. Your responses and results are confidential, used solely to generate your diagnostic, and never shared with third parties or used to train AI models.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">Can I retake my diagnostic and track my progress over time?</summary>
              <div className="sp-faq-answer">
                <p>
                  Yes — WunderBrand Snapshot+™ includes the ability to retake your diagnostic and see how your WunderBrand Score™ changes over time. Refreshes are $47 each. We recommend refreshing quarterly. Your original results are always available for comparison.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">Can I share my results with my team or agency?</summary>
              <div className="sp-faq-answer">
                <p>
                  Yes — your results are yours. Download the PDF and share it with anyone who needs it. Many teams use their WunderBrand Snapshot+™ results as a briefing document for internal alignment, agency onboarding, or stakeholder conversations. Need a more hands-on workspace?{" "}
                  <Link href="/brand-blueprint">WunderBrand Blueprint™</Link> includes an Interactive Brand Workbook built for exactly that.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">What if I want to go further after my results?</summary>
              <div className="sp-faq-answer">
                <p>
                  Every dollar you spend on WunderBrand Snapshot+™ is credited toward{" "}
                  <Link href="/brand-blueprint">WunderBrand Blueprint™</Link> ($997) or{" "}
                  <Link href="/brand-blueprint-plus">WunderBrand Blueprint+™</Link> ($1,997). You don&apos;t lose your investment — you build on it. And you can always{" "}
                  <a href={TALK} target="_blank" rel="noopener noreferrer">
                    talk to an expert
                  </a>{" "}
                  to figure out which product makes the most sense for where you are now.
                </p>
              </div>
            </details>
            <details className="sp-faq-item">
              <summary className="sp-faq-question">How do I access my results later?</summary>
              <div className="sp-faq-answer">
                <p>
                  All results are saved to your dashboard and accessible from any device via the link we email you after delivery. A full PDF is also available to download anytime. If you ever need to find your results, visit the access page and enter the email you used — we&apos;ll send you a direct link.
                </p>
              </div>
            </details>
          </div>
          <p className="sp-faq-more">
            Have another question?{" "}
            <a href={FAQ} className="sp-faq-link" target="_blank" rel="noopener noreferrer">
              See all FAQs
            </a>{" "}
            or{" "}
            <a href={TALK} className="sp-faq-link" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
            .
          </p>
        </section>
      </div>

      {/* Bottom CTA */}
      <section className="sp-final-cta">
        <div className="sp-final-cta-inner">
          <h2 className="sp-final-heading">
            Your brand is making an impression right now — the question is whether it&apos;s the right one.
          </h2>
          <p className="sp-final-copy">
            WunderBrand Snapshot+™ shows you exactly where the gaps are, what they&apos;re costing you, and what to do about it — with the analysis, guidelines, and tools to start making changes immediately. Not someday. This week.
          </p>
          <div className="sp-mid-cta-buttons">
            <Link href={CHECKOUT} className="sp-btn-primary">
              Get WunderBrand Snapshot+™ — $497
            </Link>
          </div>
          <p className="sp-cta-features-link">
            <Link href={FEATURES}>
              See everything that&apos;s included →
            </Link>
          </p>
          <p className="sp-cta-lockline">
            Already purchased another Wunderbar Digital product? Your investment is credited automatically. Your responses are confidential and never shared with third parties.
          </p>
        </div>
      </section>
    </main>
  );
}
