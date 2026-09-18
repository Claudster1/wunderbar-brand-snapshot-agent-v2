import Link from "next/link";
import type { ProductFeaturesData } from "@/lib/marketing/productFeatures/types";
import "./product-features.css";

const TALK =
  "https://wunderbardigital.com/talk-to-an-expert?utm_source=wunderbrand_app&utm_medium=features_page&utm_campaign=talk_expert&utm_content=features_footer";

type Props = {
  data: ProductFeaturesData;
};

export function ProductFeaturesBreakdown({ data }: Props) {
  return (
    <main className="pf-section bg-white font-brand">
      <div className="pf-container">
        <div>
          <Link href={data.productHref} className="pf-back-link">
            ← Back to {data.productName}
          </Link>
        </div>

        <div className="pf-table-header">
          <div className="pf-header-cell">What&apos;s Included</div>
          <div className="pf-header-cell">What It Does for You</div>
        </div>

        {data.sections.map((section) => (
          <div key={section.title}>
            <div className="pf-table-section-header">
              <span>{section.title}</span>
            </div>
            {section.rows.map((row) => (
              <div key={`${section.title}::${row.feature}`} className="pf-table-row">
                <div className="pf-cell-feature">{row.feature}</div>
                <div className="pf-cell-benefit">{row.benefit}</div>
              </div>
            ))}
          </div>
        ))}

        {data.footnote ? <p className="pf-footnote">{data.footnote}</p> : null}

        <div className="pf-features-links">
          <p className="pf-features-links-lead">
            {data.upgradeLead}{" "}
            <Link href={data.upgradeHref} className="pf-features-link-primary">
              {data.upgradeLabel}
            </Link>
          </p>
          <div className="pf-features-links-row">
            <Link href="/brand-suite#compare" className="pf-features-link">
              Compare All Products
            </Link>
            <span className="pf-features-link-sep">·</span>
            <a href={TALK} className="pf-features-link" target="_blank" rel="noopener noreferrer">
              Talk to an Expert
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
