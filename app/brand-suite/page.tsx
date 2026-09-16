import type { Metadata } from "next";
import Link from "next/link";
import { SuiteCompareSection } from "./SuiteCompareSection";
import "./suite-landing.css";

export const metadata: Metadata = {
  title: "WunderBrand Suite™ | Compare Products",
  description:
    "Compare WunderBrand Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™ — choose the right brand strategy product and start in the app.",
  openGraph: {
    title: "WunderBrand Suite™ | Compare Products",
    description: "Feature comparison and product matcher for the WunderBrand Suite™.",
    url: "https://app.wunderbrand.ai/brand-suite",
    images: [{ url: "/marketing/wunderbrand-snapshot-hero.jpg", alt: "WunderBrand Suite™" }],
  },
};

const TALK =
  "https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=talk_expert&utm_content=suite";
const FAQ =
  "https://wunderbardigital.com/faq?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=suite_faq&utm_content=see_all_faqs";
const SCORE =
  "https://wunderbardigital.com/wunderbrand-score?utm_source=wunderbrand_app&utm_medium=product_page&utm_campaign=suite_score&utm_content=wunderbrand_score";

const MATCHERS = [
  {
    tier: "WunderBrand Snapshot™",
    price: "Free",
    desc: "An honest picture of where your brand stands — WunderBrand Score™, five-pillar analysis, and what to focus on first. No credit card.",
    href: "/brand-snapshot",
    label: "Start Free Snapshot™",
    featured: true,
  },
  {
    tier: "WunderBrand Snapshot+™",
    price: "$497",
    desc: "You know your brand needs work but aren't sure where to focus. You want pillar-by-pillar analysis, a voice and tone guide, visual direction, an ideal customer profile, AI prompts, and a prioritized action plan.",
    href: "/brand-snapshot/plus",
    label: "View Snapshot+™",
    featured: false,
  },
  {
    tier: "WunderBrand Blueprint™",
    price: "$997",
    desc: "You're ready for a complete brand strategy — messaging system, buyer personas, competitive positioning, content strategy, and a prioritized action plan your team can execute against immediately.",
    href: "/brand-blueprint",
    label: "View Blueprint™",
    featured: false,
  },
  {
    tier: "WunderBrand Blueprint+™",
    price: "$1,997",
    desc: "You want the full strategic playbook — with implementation guides, templates, a week-by-week 90-day roadmap, campaign strategy, unlimited edits and refreshes for the first year, and a Strategy Activation Session.",
    href: "/brand-blueprint-plus",
    label: "View Blueprint+™",
    featured: false,
  },
] as const;

export default function BrandSuitePage() {
  return (
    <main className="bg-white font-brand">
      <section className="ws-hero">
        <div className="ws-hero-container">
          <div className="ws-hero-panel">
            <span className="ws-eyebrow">WunderBrand Suite™</span>
            <h1 className="ws-h1">Choose the right product — then start in the app</h1>
            <p className="ws-lead">
              Compare Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™ side by side. Every paid product checks out
              here so upgrade credits apply automatically.
            </p>
            <div className="ws-hero-cta-group">
              <Link href="/brand-snapshot" className="ws-btn-primary">
                Start Free Snapshot™
              </Link>
              <a href="#compare" className="ws-btn-outline-white">
                Compare Products
              </a>
            </div>
          </div>
        </div>
      </section>

      <nav className="ws-sticky-nav" aria-label="Suite page sections">
        <div className="ws-sticky-nav-inner">
          <a href="#overview" className="ws-nav-link">
            Overview
          </a>
          <a href="#how-it-works" className="ws-nav-link">
            How It Works
          </a>
          <a href="#compare" className="ws-nav-link">
            Compare
          </a>
          <a href="#faqs" className="ws-nav-link">
            FAQs
          </a>
          <div className="ws-nav-cta">
            <Link href="/brand-snapshot">Start Free Snapshot™ →</Link>
          </div>
        </div>
      </nav>

      <div className="ws-body-segment">
        <section className="ws-section" id="overview">
          <h2 className="ws-section-heading">WunderBrand Suite™</h2>
          <p className="ws-copy ws-intro">A proprietary brand strategy system — not a generic AI tool.</p>
          <p className="ws-copy">
            Every product starts with your{" "}
            <a href={SCORE} className="ws-inline-link" target="_blank" rel="noopener noreferrer">
              WunderBrand Score™
            </a>{" "}
            — then goes deeper: analysis, strategy, implementation. Use the matcher below or open the full comparison
            chart.
          </p>

          <span className="ws-eyebrow">Which One Is Right for You?</span>
          <div className="ws-matcher-grid">
            {MATCHERS.map((m) => (
              <div key={m.tier} className={`ws-matcher-card${m.featured ? " ws-matcher-featured" : ""}`}>
                <div className="ws-matcher-tier">{m.tier}</div>
                <div className={`ws-matcher-price${m.price === "Free" ? " ws-matcher-price-free" : ""}`}>
                  {m.price}
                </div>
                <p className="ws-matcher-desc">{m.desc}</p>
                <Link href={m.href} className="ws-matcher-btn">
                  {m.label}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="ws-section" id="how-it-works">
          <span className="ws-eyebrow">How It Works</span>
          <h2 className="ws-section-heading">Three steps to brand clarity</h2>
          <p className="ws-copy">
            Free Snapshot™ takes about 10–15 minutes. Paid products typically take 20–30 minutes. No prep needed — answer
            honestly from where you are today.
          </p>
          <div className="ws-steps">
            <div className="ws-step">
              <div className="ws-step-number">1</div>
              <div>
                <h3 className="ws-step-title">Start your diagnostic</h3>
                <p className="ws-step-desc">
                  Answer questions about your business, audience, and how you show up today. The more specific you are,
                  the more tailored your results.
                </p>
              </div>
            </div>
            <div className="ws-step-connector" aria-hidden />
            <div className="ws-step">
              <div className="ws-step-number">2</div>
              <div>
                <h3 className="ws-step-title">Get your WunderBrand Score™</h3>
                <p className="ws-step-desc">
                  Your brand is scored across five pillars — with clear insights into what&apos;s working, what&apos;s
                  not, and why it matters.
                </p>
              </div>
            </div>
            <div className="ws-step-connector" aria-hidden />
            <div className="ws-step">
              <div className="ws-step-number">3</div>
              <div>
                <h3 className="ws-step-title">Act on what you find</h3>
                <p className="ws-step-desc">
                  Every product gives prioritized next steps you can act on immediately — or share with your team,
                  agency, or contractors.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="ws-section">
          <span className="ws-eyebrow">Built to Be Used — Not Just Read</span>
          <h2 className="ws-section-heading">One brand strategy. Every channel. Everyone on the same page.</h2>
          <div className="ws-use-grid">
            <div className="ws-use-card">
              <h3 className="ws-use-title">With your team</h3>
              <p className="ws-use-desc">
                Hand it to anyone who writes, designs, or speaks for your brand — so they stop guessing and start
                executing from the same playbook.
              </p>
            </div>
            <div className="ws-use-card">
              <h3 className="ws-use-title">With your agency or contractors</h3>
              <p className="ws-use-desc">
                Skip weeks of brand education. Give partners the strategy and let them focus on execution.
              </p>
            </div>
            <div className="ws-use-card">
              <h3 className="ws-use-title">With your AI tools</h3>
              <p className="ws-use-desc">
                Paste brand context into ChatGPT, Claude, or any AI tool and get output that actually sounds like you.
              </p>
            </div>
          </div>
        </section>

        <SuiteCompareSection />

        <section className="ws-section" id="faqs">
          <span className="ws-eyebrow">Frequently Asked Questions</span>
          <h2 className="ws-section-heading">Questions that affect your purchase</h2>
          <div>
            <details className="ws-faq-item">
              <summary className="ws-faq-question">Which product is right for me?</summary>
              <div className="ws-faq-answer">
                <p>
                  <Link href="/brand-snapshot" className="ws-inline-link">
                    Snapshot™
                  </Link>{" "}
                  (free) shows where you stand.{" "}
                  <Link href="/brand-snapshot/plus" className="ws-inline-link">
                    Snapshot+™
                  </Link>{" "}
                  ($497) shows what to do next.{" "}
                  <Link href="/brand-blueprint" className="ws-inline-link">
                    Blueprint™
                  </Link>{" "}
                  ($997) is a full strategy foundation.{" "}
                  <Link href="/brand-blueprint-plus" className="ws-inline-link">
                    Blueprint+™
                  </Link>{" "}
                  ($1,997) adds implementation, unlimited year-one refreshes, and a Strategy Activation Session.
                </p>
              </div>
            </details>
            <details className="ws-faq-item">
              <summary className="ws-faq-question">Do prior purchases credit toward upgrades?</summary>
              <div className="ws-faq-answer">
                <p>
                  Yes — every dollar spent on a prior WunderBrand product is credited toward your next one when you
                  check out in the app. That&apos;s why buy links live here, not on external Payment Links.
                </p>
              </div>
            </details>
            <details className="ws-faq-item">
              <summary className="ws-faq-question">Can I retake and track progress?</summary>
              <div className="ws-faq-answer">
                <p>
                  Snapshot™ retakes are free. Snapshot+™ refreshes are $47. Blueprint™ includes one complimentary
                  refresh in the first 90 days, then $97. Blueprint+™ includes unlimited edits and refreshes for the
                  first year.
                </p>
              </div>
            </details>
            <details className="ws-faq-item">
              <summary className="ws-faq-question">What&apos;s the refund policy?</summary>
              <div className="ws-faq-answer">
                <p>
                  Because products are delivered digitally and immediately accessible, we don&apos;t offer refunds. Start
                  with free Snapshot™ to experience the approach before purchasing.
                </p>
              </div>
            </details>
          </div>
          <p className="ws-faq-more">
            More questions?{" "}
            <a href={FAQ} className="ws-inline-link" target="_blank" rel="noopener noreferrer">
              See all FAQs
            </a>{" "}
            or{" "}
            <a href={TALK} className="ws-inline-link" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
            .
          </p>
        </section>
      </div>

      <section className="ws-final-cta">
        <div className="ws-final-cta-inner">
          <h2 className="ws-final-heading">Start with clarity. Grow with confidence.</h2>
          <p className="ws-final-copy">
            Begin free — or open a product page and check out with upgrade credit applied automatically.
          </p>
          <Link href="/brand-snapshot" className="ws-btn-primary">
            Start Free WunderBrand Snapshot™
          </Link>
        </div>
      </section>
    </main>
  );
}
