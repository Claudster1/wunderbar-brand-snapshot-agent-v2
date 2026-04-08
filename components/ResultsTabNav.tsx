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

const NAVY = "#021859";
const MID_GRAY = "#5A6B7E";
const BORDER = "#E0E8F0";

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
  const activeTabStyle: CSSProperties = {
    padding: "16px 20px",
    background: "none",
    border: "none",
    borderBottom: `3px solid ${NAVY}`,
    color: NAVY,
    fontWeight: 700,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    marginBottom: -2,
  };

  const inactiveTabStyle: CSSProperties = {
    padding: "16px 20px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    color: MID_GRAY,
    fontWeight: 700,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    marginBottom: -2,
    transition: "color 0.12s, border-color 0.12s",
  };

  const lockedTabStyle: CSSProperties = {
    ...inactiveTabStyle,
    color: "#CBD5E0",
    cursor: "not-allowed",
  };

  return (
    <nav
      className="results-tab-nav"
      style={{
        position: "sticky",
        top: 64,
        zIndex: 200,
        backgroundColor: "#ffffff",
        borderBottom: `2px solid ${BORDER}`,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", display: "flex", gap: 0 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {TAB_DEFINITIONS.map((tab) => {
            const available = isTabAvailable(tab, productTier);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (available) onTabChange(tab.id);
                  else onLockedTabClick(tab);
                }}
                style={isActive ? activeTabStyle : available ? inactiveTabStyle : lockedTabStyle}
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
