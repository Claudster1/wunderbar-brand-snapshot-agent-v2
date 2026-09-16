"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Cell } from "./suiteComparisonData";
import { COMPARE_SECTIONS } from "./suiteComparisonData";

function CellView({ value }: { value: Cell }) {
  if (value === "check") return <span className="ws-checkmark">✓</span>;
  if (value === "dash") return <span className="ws-dash">—</span>;
  return <span className="ws-tier-label">{value}</span>;
}

const PRODUCT_CTAS = [
  { href: "/brand-snapshot", label: "Start Free Snapshot™" },
  { href: "/brand-snapshot/plus", label: "View Snapshot+™" },
  { href: "/brand-blueprint", label: "View Blueprint™" },
  { href: "/brand-blueprint-plus", label: "View Blueprint+™" },
] as const;

export function SuiteCompareSection() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#compare") setOpen(true);
  }, []);

  return (
    <div className="ws-compare-toggle-section" id="compare">
      <div className="ws-compare-toggle-header">
        <div>
          <span className="ws-compare-eyebrow">Feature Comparison</span>
          <h2 className="ws-compare-heading">Compare All Products</h2>
        </div>
        <button
          type="button"
          className="ws-compare-toggle-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Hide Comparison ↑" : "Show Full Comparison ↓"}
        </button>
      </div>

      {open ? (
        <section className="ws-suite-comparison-section" id="suite-comparison">
          <p className="ws-section-intro">
            Start with a free brand diagnostic. Go deeper when you&apos;re ready to turn clarity into strategy.
          </p>
          <p className="ws-section-subtitle">
            Frameworks define your strategy system; prompt assets operationalize that strategy in AI tools.
          </p>

          <div className="ws-comparison-table">
            <div className="ws-table-header">
              <div className="ws-header-cell ws-empty" />
              <div className="ws-header-cell">
                <div className="ws-product-name">SNAPSHOT™</div>
                <div className="ws-product-subtitle">Free</div>
                <div className="ws-product-positioning">See where you stand</div>
              </div>
              <div className="ws-header-cell">
                <div className="ws-product-name">SNAPSHOT+™</div>
                <div className="ws-product-subtitle">$497</div>
                <div className="ws-product-positioning">Know where to focus</div>
              </div>
              <div className="ws-header-cell">
                <div className="ws-product-name">BLUEPRINT™</div>
                <div className="ws-product-subtitle">$997</div>
                <div className="ws-product-positioning">Get your full strategy</div>
              </div>
              <div className="ws-header-cell">
                <div className="ws-product-name">BLUEPRINT+™</div>
                <div className="ws-product-subtitle">$1,997</div>
                <div className="ws-product-positioning">Strategy + implementation</div>
              </div>
            </div>

            {COMPARE_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="ws-table-section-header">
                  <h4 className="ws-eyebrow">{section.title}</h4>
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`ws-table-row${
                      i === section.rows.length - 1 &&
                      section === COMPARE_SECTIONS[COMPARE_SECTIONS.length - 1]
                        ? " ws-last-row"
                        : ""
                    }`}
                  >
                    <div className="ws-feature-cell">{row.feature}</div>
                    {row.cells.map((cell, idx) => (
                      <div key={idx} className="ws-check-cell">
                        <CellView value={cell} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            <div className="ws-table-cta-row">
              <div className="ws-cta-cell" />
              {PRODUCT_CTAS.map((cta) => (
                <div key={cta.href} className="ws-cta-cell">
                  <Link href={cta.href} className="ws-table-btn">
                    {cta.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="ws-footnotes">
            <p className="ws-footnote">
              †Competitive analysis and SEO strategy are based on AI-informed insights — validate competitor claims and
              confirm keyword data with tools like Google Keyword Planner or SEMrush.
            </p>
            <p className="ws-footnote">
              ‡The Interactive Brand Workbook is a structured workspace to apply your strategy. Blueprint™ includes a
              14-day review window; Blueprint+™ is always editable.
            </p>
            <p className="ws-footnote">
              §All refreshes and edits apply to the assessed brand only — one company, one brand. After year one, annual
              refresh plans are available.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
