"use client";

import type { ReactNode } from "react";
import TabSectionMenu, { type TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import { SUITE_CHIP_CARD_STYLE } from "@/components/results/suiteBrandTokens";
import { TAB_SECTION_NAV_HINT } from "@/lib/copy/resultsSuiteGuidance";
import { useActiveSectionInView } from "@/components/results/useActiveSectionInView";

type Props = {
  /** Page name for the section jump bar (shown uppercase, e.g. Brand Standards). */
  navTitle: string;
  navItems: TabSectionMenuItem[];
  children: ReactNode;
  /** Optional class on outer wrapper for tab-specific styling */
  className?: string;
  /** Hint under the chips title; set false to hide. Default explains scroll-to-section behavior. */
  sectionNavHint?: string | false;
  /**
   * Leading glyphs in section nav. Default true — they help users scan long lists; set false for text-only.
   */
  sectionNavIcons?: boolean;
};

/** Sticky offset below CompactResultsHeader (64px) + ResultsTabNav (~56px). */
const SECTION_NAV_STICKY_TOP = 120;

/**
 * Section jump chips + sticky left nav + main content.
 * Chips are sticky in the main column so in-tab section navigation stays visible while scrolling (not only the sidebar).
 */
export default function TabPageWithSidebar({
  navTitle,
  navItems,
  children,
  className,
  sectionNavHint,
  sectionNavIcons = true,
}: Props) {
  const chipsHint = sectionNavHint === false ? undefined : (sectionNavHint ?? TAB_SECTION_NAV_HINT);
  const sectionIdsKey = navItems.map((item) => item.id).join("\0");
  const activeSectionId = useActiveSectionInView(sectionIdsKey);

  return (
    <div
      className={`tab-page-with-sidebar ${className ?? ""}`.trim()}
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 28px 80px",
        boxSizing: "border-box",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <div
        className="tab-page-sidebar-row"
        style={{
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        <aside
          className="tab-page-sidebar"
          style={{
            width: 236,
            flexShrink: 0,
            position: "sticky",
            top: SECTION_NAV_STICKY_TOP,
            alignSelf: "flex-start",
            maxHeight: "calc(100dvh - 9rem)",
            overflowY: "auto",
            overscrollBehavior: "contain",
          }}
        >
          <TabSectionMenu
            title={navTitle}
            items={navItems}
            variant="sidebar"
            activeSectionId={activeSectionId}
            showIcons={sectionNavIcons}
          />
        </aside>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              position: "sticky",
              top: SECTION_NAV_STICKY_TOP,
              zIndex: 50,
              marginBottom: 16,
              paddingBottom: 4,
              backgroundColor: "#F5F7FA",
              boxShadow: "0 6px 16px rgba(2, 24, 89, 0.06)",
            }}
          >
            <div style={SUITE_CHIP_CARD_STYLE}>
              <TabSectionMenu
                title={navTitle}
                items={navItems}
                variant="chips"
                description={chipsHint}
                activeSectionId={activeSectionId}
                showIcons={sectionNavIcons}
              />
            </div>
          </div>
          <div className="tab-page-main" style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
