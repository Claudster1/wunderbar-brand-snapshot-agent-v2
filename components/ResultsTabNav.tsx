"use client";

import type { CSSProperties } from "react";
import {
  TAB_DEFINITIONS,
  TIER_RANK,
  isTabAvailable,
  type ProductTier,
  type ResultsTab,
  type ResultsTabDefinition,
} from "@/components/results/tabConfig";
import {
  SUITE_BG_CARD,
  SUITE_BACKDROP_BLUR,
  SUITE_BG_CHROME,
  SUITE_CHROME_MUTED,
  SUITE_FONT_UI,
  SUITE_NAVY,
  SUITE_SHADOW_TAB_PILL,
  SUITE_CONTENT_MAX_PX,
} from "@/components/results/suiteBrandTokens";

const HEADER_CHROME_HEIGHT = 56;

interface ResultsTabNavProps {
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
  productTier: ProductTier;
  onLockedTabClick: (tab: ResultsTabDefinition) => void;
}

export default function ResultsTabNav({
  activeTab,
  onTabChange,
  productTier,
  onLockedTabClick,
}: ResultsTabNavProps) {
  const trackStyle: CSSProperties = {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: 4,
    padding: 4,
    borderRadius: 12,
    background: "rgba(0, 0, 0, 0.045)",
    maxWidth: "100%",
  };

  function tabButtonStyle(isActive: boolean, locked: boolean): CSSProperties {
    return {
      padding: "9px 14px",
      borderRadius: 9,
      border: "none",
      background: isActive ? SUITE_BG_CARD : "transparent",
      color: locked ? "#C7C7CC" : isActive ? SUITE_NAVY : SUITE_CHROME_MUTED,
      fontWeight: isActive ? 600 : 500,
      fontSize: 13,
      letterSpacing: "-0.015em",
      cursor: locked ? "not-allowed" : "pointer",
      fontFamily: SUITE_FONT_UI,
      boxShadow: isActive ? SUITE_SHADOW_TAB_PILL : "none",
      transition: "color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, opacity 0.2s ease",
      opacity: locked ? 0.55 : 1,
      whiteSpace: "nowrap",
    };
  }

  return (
    <nav
      className="results-tab-nav"
      style={{
        position: "sticky",
        top: HEADER_CHROME_HEIGHT,
        zIndex: 200,
        ...SUITE_BACKDROP_BLUR,
        backgroundColor: SUITE_BG_CHROME,
        borderBottom: `1px solid rgba(0, 0, 0, 0.06)`,
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div
        style={{
          maxWidth: SUITE_CONTENT_MAX_PX,
          margin: "0 auto",
          padding: "10px 24px 12px",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="results-tab-nav-scroll"
      >
        <div style={trackStyle}>
          {TAB_DEFINITIONS.map((tab) => {
            const available = isTabAvailable(tab, productTier);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (available) onTabChange(tab.id);
                  else onLockedTabClick(tab);
                }}
                style={tabButtonStyle(isActive, !available)}
                aria-selected={isActive}
                aria-disabled={!available}
              >
                {tab.label}
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
