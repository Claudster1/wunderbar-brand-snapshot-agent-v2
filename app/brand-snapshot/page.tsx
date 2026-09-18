import type { Metadata } from "next";
import Link from "next/link";
import "./snapshot-landing.css";

export const metadata: Metadata = {
  title: "WunderBrand Snapshot™ | Free Brand Diagnostic",
  description:
    "A structured, AI-powered brand diagnostic that shows you exactly where your brand stands today — and which pillar is holding everything else back. Free. 10–15 minutes.",
  openGraph: {
    title: "WunderBrand Snapshot™ | Free Brand Diagnostic",
    description:
      "Your brand, diagnosed in minutes — free. WunderBrand Score™, five-pillar insights, and a clear place to focus first.",
    url: "https://app.wunderbrand.ai/brand-snapshot",
    images: [
      {
        url: "/marketing/wunderbrand-snapshot-hero.jpg",
        width: 1200,
        height: 630,
        alt: "WunderBrand Snapshot™",
      },
    ],
  },
};

const START_CHAT = "/";

const SNAPSHOT_PLUS_PAGE = "/brand-snapshot/plus";

const TALK_EXPERT =
  "https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=talk_expert&utm_content=snapshot_page";

const SCORE_URL =
  "https://wunderbardigital.com/wunderbrand-score?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=snapshot_score&utm_content=wunderbrand_score";
const FAQ_URL =
  "https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=snapshot_faq&utm_content=see_all_faqs";
/** Free Snapshot has no separate features page on marketing (404) — use in-app suite compare. */
const FEATURES_HREF = "/brand-suite#compare";

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#07B0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#07B0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#07B0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export default function BrandSnapshotPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="wd-hero-free">
        <div className="wd-container">
          <div className="wd-hero-panel">
            <span className="wd-eyebrow">WunderBrand Snapshot™</span>
            <h1 className="wd-h1">Your Brand, Diagnosed — In Minutes, for Free</h1>
            <p className="wd-p">
              A structured, AI-powered brand diagnostic that shows you exactly where your brand stands today — and which pillar is holding everything else back!
            </p>
            <Link href={START_CHAT} className="wd-btn">
              Start Your Free WunderBrand Snapshot™
            </Link>
          </div>
        </div>
      </section>

      {/* Body — deal.ai segment: TOP 50, BOTTOM 0, L/R 15 */}
      <div className="wd-body-segment">
      {/* Intro */}
      <section className="bs-intro-section">
        <div className="bs-intro-container">
          <p className="bs-intro-lead">
            Your brand, scored across five pillars — with the clarity to know exactly where to focus first.
          </p>
          <p className="bs-intro-text">
            WunderBrand Snapshot™ is a free strategic brand diagnostic — not a quiz, not a lead magnet, not a teaser for something you have to pay for. It&apos;s a real analysis built on the same proprietary five-pillar framework used across the entire WunderBrand Suite™.
          </p>
          <p className="bs-intro-text">
            Answer a focused set of questions about your business, your audience, and how your brand shows up today. In under a minute, you&apos;ll have your WunderBrand Score™, your brand archetype, a competitive vulnerability read, and a prioritized view of exactly where to focus first.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bs-features-section">
        <div className="bs-features-container">
          <h2 className="bs-features-heading">Everything you get — completely free.</h2>
          <p className="bs-features-intro">
            WunderBrand Snapshot™ is a strategic diagnostic built on the same proprietary five-pillar framework used across the entire{" "}
            <Link href="/brand-suite" className="bs-inline-link">
              WunderBrand Suite™
            </Link>
            . You&apos;ll receive a{" "}
            <a href={SCORE_URL} target="_blank" rel="noopener noreferrer" className="bs-inline-link">
              WunderBrand Score™
            </a>
            , pillar-level insights, and a prioritized view of what to focus on first — no fluff, no generic tips.
          </p>

          <div className="bs-value-row">
            <div className="bs-value-card">
              <span className="bs-value-icon">
                <ClockIcon />
              </span>
              <strong className="bs-value-label">10–15 minutes</strong>
              <span className="bs-value-desc">Auto-save built in — pause and return anytime</span>
            </div>
            <div className="bs-value-card">
              <span className="bs-value-icon">
                <DollarIcon />
              </span>
              <strong className="bs-value-label">Completely free</strong>
              <span className="bs-value-desc">No credit card, no sales call, no catch</span>
            </div>
            <div className="bs-value-card">
              <span className="bs-value-icon">
                <PulseIcon />
              </span>
              <strong className="bs-value-label">Instant results</strong>
              <span className="bs-value-desc">Your scored diagnostic is generated in under a minute</span>
            </div>
          </div>

          <div className="bs-cta-block">
            <Link href={START_CHAT} className="bs-cta-btn">
              Start Your Free WunderBrand Snapshot™
            </Link>
          </div>

          <h3 className="bs-section-title">What You&apos;ll Walk Away With</h3>
          <p className="bs-section-subtitle">
            A scored diagnostic, pillar-level insights, your brand archetype, competitive signals, and a prioritized view of what matters most — delivered instantly.
          </p>

          <div className="bs-features-table">
            <div className="bs-table-header">
              <div className="bs-header-cell bs-header-feature">What&apos;s Included</div>
              <div className="bs-header-cell bs-header-benefit">Why It Matters</div>
            </div>

            <div className="bs-table-section-header">
              <span>Your Brand Score</span>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">
                <a href={SCORE_URL} target="_blank" rel="noopener noreferrer" className="bs-feature-link">
                  WunderBrand Score™
                </a>
              </div>
              <div className="bs-cell-benefit">
                One number (0–100) that tells you how well your brand&apos;s five pillars work together as a system. Most business owners are surprised by their score — and relieved to finally have a clear starting point instead of guessing.
              </div>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Five-Pillar Brand Review</div>
              <div className="bs-cell-benefit">
                Your brand scored across positioning, messaging, visibility, credibility, and conversion. You&apos;ll see which pillars are pulling their weight — and which ones are quietly undermining everything else.
              </div>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Per-Pillar Insights</div>
              <div className="bs-cell-benefit">
                Individual scores with context for each pillar. Instead of a vague &quot;your brand needs work,&quot; you&apos;ll know exactly which area to tackle first — and why it matters more than the others right now.
              </div>
            </div>

            <div className="bs-table-section-header">
              <span>Where to Focus</span>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Priority Diagnosis</div>
              <div className="bs-cell-benefit">
                The two or three things that will make the biggest difference for your brand right now — prioritized by impact so you&apos;re not wasting time on the wrong problems.
              </div>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Competitive Vulnerability Signal</div>
              <div className="bs-cell-benefit">
                A read on where your brand is most exposed to competitors — derived from the pattern across your pillar scores. You&apos;ll know which gap a competitor could exploit before it costs you business.
              </div>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Audience Alignment Read</div>
              <div className="bs-cell-benefit">
                A targeted insight into how well your brand connects with the audience you&apos;re actually trying to reach — based on your primary pillar and the gaps the diagnostic surfaces.
              </div>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Three Immediate Next Steps</div>
              <div className="bs-cell-benefit">
                Specific, actionable moves you can make this week. Not generic advice — actions tied directly to your diagnostic results and the gaps in your brand.
              </div>
            </div>

            <div className="bs-table-section-header">
              <span>Your Brand Personality</span>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Brand Archetype</div>
              <div className="bs-cell-benefit">
                Your brand&apos;s primary archetype — the personality pattern that shapes how you should sound, show up, and connect with your audience. A strategic foundation for consistent voice and tone across every channel.
              </div>
            </div>

            <div className="bs-table-section-header">
              <span>Track Your Progress</span>
            </div>
            <div className="bs-table-row">
              <div className="bs-cell-feature">Always free</div>
              <div className="bs-cell-benefit">
                Come back after you&apos;ve made changes and retake for free. Watch your WunderBrand Score™ climb as you close the gaps — and know exactly where to focus next.
              </div>
            </div>
          </div>

          <div className="bs-audience-block">
            <h3 className="bs-section-title">Who WunderBrand Snapshot™ is for</h3>
            <div className="bs-audience-grid">
              <div className="bs-audience-item">
                <strong>You know something&apos;s off with your brand</strong> but can&apos;t pinpoint what — and you&apos;re tired of guessing.
              </div>
              <div className="bs-audience-item">
                <strong>You&apos;re growing fast</strong> and need to know if your brand can keep up — or if it&apos;s already holding you back.
              </div>
              <div className="bs-audience-item">
                <strong>You&apos;re about to invest in marketing</strong> and want to make sure you&apos;re building on a solid foundation first.
              </div>
              <div className="bs-audience-item">
                <strong>You want an honest, data-driven picture</strong> — not a sales pitch disguised as a brand audit.
              </div>
            </div>
          </div>

          <div className="bs-cta-block bs-cta-bottom">
            <p className="bs-cta-lead">10–15 minutes. No credit card. Instant results.</p>
            <Link href={START_CHAT} className="bs-cta-btn">
              Start Your Free WunderBrand Snapshot™
            </Link>
          </div>

          <div className="bs-features-links">
            <p className="bs-features-links-lead">
              Want deeper analysis with a pillar-by-pillar deep dive, voice and tone guide, communication guidelines, brand color palette, visual direction, AI prompts, and a prioritized action plan?{" "}
              <Link href={SNAPSHOT_PLUS_PAGE} className="bs-features-link-primary">
                See WunderBrand Snapshot+™ →
              </Link>
            </p>
            <div className="bs-features-links-row">
              <Link href="/brand-suite#compare" className="bs-features-link">
                Compare All Products
              </Link>
              <span className="bs-features-link-sep">·</span>
              <a href={TALK_EXPERT} className="bs-features-link" target="_blank" rel="noopener noreferrer">
                Talk to an Expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bas-process-section">
        <div className="bas-process-container">
          <h2 className="bas-process-heading">How It Works</h2>
          <p className="bas-process-intro">From first question to actionable score — here&apos;s what happens.</p>
          <div className="bas-process-steps">
            <div className="bas-process-step">
              <div className="bas-step-number">1</div>
              <h3 className="bas-step-title">Answer Questions About Your Brand</h3>
              <p className="bas-step-desc">
                Complete a focused diagnostic covering your business type, audience, competitors, and goals. It takes about 10–15 minutes — no prep needed, no credit card required. Auto-save is built in, so you can pause and return anytime. Your responses are confidential and never shared with third parties.
              </p>
            </div>
            <div className="bas-process-step">
              <div className="bas-step-number">2</div>
              <h3 className="bas-step-title">Your WunderBrand Score™ Is Calculated</h3>
              <p className="bas-step-desc">
                Our proprietary diagnostic engine analyzes your responses across all five pillars — positioning, messaging, visibility, credibility, and conversion — calibrated to your specific business type. Your score (0–100) and per-pillar insights are delivered in real time, typically in under a minute.
              </p>
            </div>
            <div className="bas-process-step">
              <div className="bas-step-number">3</div>
              <h3 className="bas-step-title">See Exactly Where to Focus</h3>
              <p className="bas-step-desc">
                Your score comes with a pillar-by-pillar breakdown, a priority diagnosis, your brand archetype, a competitive vulnerability signal, an audience alignment read, and three immediate next steps tied directly to your results. Take action on your own or go deeper with a paid product in the{" "}
                <Link href="/brand-suite" className="bs-inline-link">
                  WunderBrand Suite™
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wd-faq">
        <div className="wd-container">
          <span className="wd-eyebrow">Frequently Asked Questions</span>
          <h2 className="wd-section-heading">Common questions about WunderBrand Snapshot™</h2>
          <div className="wd-faq-list">
            <details className="wd-faq-item">
              <summary className="wd-faq-question">Is this really free? What&apos;s the catch?</summary>
              <div className="wd-faq-answer">
                <p>
                  No catch. WunderBrand Snapshot™ is a complete brand diagnostic on its own — not a teaser, not a preview, and not a lead magnet. You&apos;ll receive a{" "}
                  <a href={SCORE_URL} target="_blank" rel="noopener noreferrer">
                    WunderBrand Score™
                  </a>
                  , pillar-level insights, your brand archetype, a competitive vulnerability signal, an audience alignment read, and a prioritized view of where focus will make the biggest difference. Most people walk away with at least one clear action they can take right away. Other products in the{" "}
                  <Link href="/brand-suite">WunderBrand Suite™</Link> go further — more context, more specificity, and more activation — but the free WunderBrand Snapshot™ is designed to be genuinely useful on its own.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">What is a WunderBrand Score™?</summary>
              <div className="wd-faq-answer">
                <p>
                  The{" "}
                  <a href={SCORE_URL} target="_blank" rel="noopener noreferrer">
                    WunderBrand Score™
                  </a>{" "}
                  is generated by Wunderbar Digital&apos;s proprietary branding system. Scored on a scale of 0–100, it measures how well your brand is aligned across five core pillars: positioning (how you&apos;re differentiated), messaging (how you communicate), visibility (how you&apos;re discovered), credibility (how you build trust), and conversion (how you turn attention into action). It&apos;s not a vanity metric — it&apos;s a diagnostic baseline that reveals where your pillars are reinforcing each other and where misalignment is holding your brand back. Every product in the{" "}
                  <Link href="/brand-suite">WunderBrand Suite™</Link> starts here.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">How long does it take?</summary>
              <div className="wd-faq-answer">
                <p>
                  About 10–15 minutes. No credit card, no account required. Auto-save is built in, so you can pause and return anytime. Your results are generated in real time once you complete the diagnostic — typically in under a minute.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">What do I get when my results are ready?</summary>
              <div className="wd-faq-answer">
                <p>
                  You&apos;ll receive a WunderBrand Score™ (0–100) with a five-pillar breakdown, per-pillar insights calibrated to your business type, your brand archetype, a competitive vulnerability signal showing where your brand is most exposed, an audience alignment read, a priority diagnosis of where to focus first, and three immediate next steps you can act on this week. Results are delivered instantly and available online — no waiting, no sales call.{" "}
                  <Link href={FEATURES_HREF}>
                    See everything that&apos;s included →
                  </Link>
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">What if I don&apos;t know the answer to a question?</summary>
              <div className="wd-faq-answer">
                <p>
                  That&apos;s completely fine — and more common than you&apos;d think. You can skip any question you&apos;re not ready to answer, and your results will still generate based on the information you&apos;ve provided. In fact, not knowing the answer to a question is often a signal in itself — it can reveal blind spots in your brand strategy that your results will help you address.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">What&apos;s the difference between WunderBrand Snapshot™ and WunderBrand Snapshot+™?</summary>
              <div className="wd-faq-answer">
                <p>
                  WunderBrand Snapshot™ is free and shows you <em>where</em> your brand needs attention — you get a WunderBrand Score™, pillar-level insights, your brand archetype, a competitive vulnerability signal, and a prioritized view of what to focus on first. It&apos;s a complete diagnostic on its own, and most people walk away with at least one clear action.
                </p>
                <p>
                  <Link href={SNAPSHOT_PLUS_PAGE}>WunderBrand Snapshot+™</Link> ($497) shows you <em>what to do about it</em>. You get a pillar-by-pillar deep dive into the contributing factors behind each score, a voice and tone guide, communication guidelines, an ideal customer profile, visual direction (color palette, typography, imagery guidance, and visual consistency rules), tagline recommendations, AI prompts calibrated to your brand, and a prioritized action plan. If WunderBrand Snapshot™ tells you what&apos;s off, WunderBrand Snapshot+™ tells you exactly how to fix it.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">Can AI really do brand strategy?</summary>
              <div className="wd-faq-answer">
                <p>
                  WunderBrand Snapshot™ isn&apos;t AI guessing at your brand — it&apos;s a structured strategic methodology powered by AI. It&apos;s built on proven brand strategy frameworks across positioning, messaging, visibility, credibility, and conversion, calibrated to your specific business type. The AI analyzes your inputs against these frameworks to surface patterns and opportunities a strategist would look for, delivered faster and at a fraction of the cost.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">How is this different from ChatGPT?</summary>
              <div className="wd-faq-answer">
                <p>
                  General AI tools give you general answers. WunderBrand Snapshot™ runs your inputs through a proprietary methodology built specifically for brand strategy — structured around five core pillars, scored against alignment benchmarks, and calibrated to your business type. You&apos;re not prompting a chatbot and hoping for useful output. You&apos;re getting a systematic analysis with a WunderBrand Score™, pillar-level insights, and specific next steps you can act on.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">What if I&apos;ve already done brand strategy work?</summary>
              <div className="wd-faq-answer">
                <p>
                  Even if you have existing brand work, WunderBrand Snapshot™ can reveal gaps, validate assumptions, or highlight where execution isn&apos;t matching strategy. Many teams use it as a diagnostic tool to pressure-test what they already have and identify what to fix first — before investing more in the wrong direction.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">Is my data confidential?</summary>
              <div className="wd-faq-answer">
                <p>
                  Yes. Your responses are confidential and will not be shared with third parties. Your data is used solely to generate your results — nothing more. Your information isn&apos;t used to train AI models or stored beyond what&apos;s needed to deliver your brand diagnostic.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">Can I retake my diagnostic and track my progress over time?</summary>
              <div className="wd-faq-answer">
                <p>
                  Yes — and it&apos;s always free. Come back after you&apos;ve made changes and retake to see how your WunderBrand Score™ has moved. Watching your score climb as you close the gaps is one of the most useful things you can do as your brand evolves. Your original results are always available for comparison.
                </p>
              </div>
            </details>

            <details className="wd-faq-item">
              <summary className="wd-faq-question">What if I want to go further after my results?</summary>
              <div className="wd-faq-answer">
                <p>
                  <Link href={SNAPSHOT_PLUS_PAGE}>WunderBrand Snapshot+™</Link> ($497) goes deeper with pillar-by-pillar analysis, a voice and tone guide, visual direction, AI prompts, and a prioritized action plan.{" "}
                  <Link href="/brand-blueprint">WunderBrand Blueprint™</Link> ($997) is a complete brand strategy — full positioning, messaging system, buyer personas, competitive intelligence, and more. Every dollar you spend on WunderBrand Snapshot+™ is credited toward WunderBrand Blueprint™ or{" "}
                  <Link href="/brand-blueprint-plus">WunderBrand Blueprint+™</Link>. You can also{" "}
                  <a href={TALK_EXPERT} target="_blank" rel="noopener noreferrer">
                    Talk to an Expert
                  </a>{" "}
                  to figure out which product makes the most sense for where you are now.
                </p>
              </div>
            </details>
          </div>

          <p className="wd-faq-more">
            Have another question?{" "}
            <a href={FAQ_URL} className="wd-faq-link" target="_blank" rel="noopener noreferrer">
              See all FAQs
            </a>{" "}
            or{" "}
            <a href={TALK_EXPERT} className="wd-faq-link" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
            .
          </p>
        </div>
      </section>
      </div>

      {/* Bottom CTA */}
      <section className="wd-bottom-cta">
        <div className="wd-bottom-cta-inner">
          <h2 className="wd-bottom-cta-headline">10–15 Minutes. Zero Cost. Real Clarity.</h2>
          <p className="wd-bottom-cta-sub">
            Find out where your brand stands today — and exactly which pillar to focus on first.
          </p>
          <div className="wd-bottom-cta-btns">
            <Link href={START_CHAT} className="wd-btn-primary">
              Start Your Free WunderBrand Snapshot™
            </Link>
            <a href={TALK_EXPERT} className="wd-btn-outline-white" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
