"use client";

import {
  TAB_DEFINITIONS,
  TIER_RANK,
  isTabAvailable,
  tierUpgradeLabelForTab,
  type ProductTier,
  type ResultsTab,
  type ResultsTabDefinition,
} from "@/components/results/tabConfig";
import {
  SUITE_BACKDROP_BLUR,
  SUITE_BG_CHROME,
  SUITE_CONTENT_MAX_PX,
  SUITE_FONT_UI,
} from "@/components/results/suiteBrandTokens";

const HEADER_CHROME_HEIGHT = 56;

interface ResultsTabNavProps {
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
  productTier: ProductTier;
  onLockedTabClick: (tab: ResultsTabDefinition) => void;
}

function TabLockIcon() {
  return (
    <svg
      className="results-tab-nav__lock"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <rect x="2.5" y="5" width="7" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4 5V3.8a2 2 0 0 1 4 0V5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ResultsTabNav({
  activeTab,
  onTabChange,
  productTier,
  onLockedTabClick,
}: ResultsTabNavProps) {
  return (
    <nav
      className="results-tab-nav"
      style={{
        position: "sticky",
        top: HEADER_CHROME_HEIGHT,
        zIndex: 200,
        ...SUITE_BACKDROP_BLUR,
        backgroundColor: SUITE_BG_CHROME,
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div
        className="results-tab-nav-scroll"
        style={{
          maxWidth: SUITE_CONTENT_MAX_PX,
          margin: "0 auto",
          padding: "10px min(24px, 4vw) 12px",
          overflowX: "auto",
        }}
      >
        <div className="results-tab-nav__track" role="tablist" aria-label="Report sections">
          {TAB_DEFINITIONS.map((tab) => {
            const available = isTabAvailable(tab, productTier);
            const isActive = activeTab === tab.id;
            const locked = !available;
            const upgradeLabel = tierUpgradeLabelForTab(tab);

            const stateClass = isActive
              ? "results-tab-nav__tab--active"
              : locked
                ? "results-tab-nav__tab--locked"
                : "results-tab-nav__tab--available";

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`results-tab-nav__tab ${stateClass}`}
                onClick={() => {
                  if (available) onTabChange(tab.id);
                  else onLockedTabClick(tab);
                }}
                aria-selected={isActive}
                aria-disabled={false}
                title={
                  locked && upgradeLabel
                    ? `${tab.label} — included in ${upgradeLabel}. Click to preview.`
                    : undefined
                }
              >
                <span className="results-tab-nav__tab-main">
                  {locked ? <TabLockIcon /> : null}
                  <span>{tab.label}</span>
                </span>
                {locked && upgradeLabel ? (
                  <span className="results-tab-nav__tier">{upgradeLabel}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export { TAB_DEFINITIONS as TABS, TIER_RANK };
export type { ProductTier, ResultsTab } from "@/components/results/tabConfig";
