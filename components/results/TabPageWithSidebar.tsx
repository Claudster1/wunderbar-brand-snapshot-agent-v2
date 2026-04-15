"use client";

import { useMemo, type ReactNode } from "react";
import FoundationStyleSuiteSidebar, {
  type FoundationSuiteSidebarGroup,
} from "@/components/results/FoundationStyleSuiteSidebar";
import TabSectionMenu, { type TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import { SUITE_CHIP_CARD_STYLE, SUITE_FONT_UI } from "@/components/results/suiteBrandTokens";
import { TAB_SECTION_NAV_HINT_SUITE_SIDEBAR } from "@/lib/copy/resultsSuiteGuidance";
import { useActiveSectionInView } from "@/components/results/useActiveSectionInView";

export type { FoundationSuiteSidebarGroup };

type Props = {
  /** Page name for the section jump bar (AP-style title case for headings, e.g. Brand Standards). */
  navTitle: string;
  navItems: TabSectionMenuItem[];
  children: ReactNode;
  /** Optional class on outer wrapper for tab-specific styling */
  className?: string;
  /**
   * When true, `ResultsTabsShell` (or another parent) renders `SUITE_CHIP_CARD_STYLE` + `TabSectionMenu`
   * above this layout — same pattern as the Foundation tab. Pass `shellActiveSectionId` from the parent’s scroll spy.
   */
  shellRendersSectionChips?: boolean;
  /** Current section id when the parent renders section chips (`shellRendersSectionChips`). */
  shellActiveSectionId?: string | null;
  /** Hint under the chips title; set false to hide. */
  sectionNavHint?: string | false;
  /**
   * Leading glyphs in section nav. Default true — they help users scan long lists; set false for text-only.
   */
  sectionNavIcons?: boolean;
  /**
   * Optional Foundation-style sidebar cards (same pattern as Foundation tab domains).
   * When omitted, one card titled `navTitle` lists all `navItems`.
   */
  sidebarGroups?: FoundationSuiteSidebarGroup[];
};

/**
 * Foundation-aligned: full-width chip card (`SUITE_CHIP_CARD_STYLE`), then flex row with
 * Foundation-style left sidebar + main column (matches `FoundationBlueprintContent` aside).
 */
export default function TabPageWithSidebar({
  navTitle,
  navItems,
  children,
  className,
  shellRendersSectionChips = false,
  shellActiveSectionId = null,
  sectionNavHint,
  sectionNavIcons = true,
  sidebarGroups: sidebarGroupsProp,
}: Props) {
  const chipsHint =
    sectionNavHint === false ? undefined : (sectionNavHint ?? TAB_SECTION_NAV_HINT_SUITE_SIDEBAR);

  const flatNavItems = useMemo(() => {
    if (sidebarGroupsProp?.length) return sidebarGroupsProp.flatMap((g) => g.items);
    return navItems;
  }, [sidebarGroupsProp, navItems]);

  const sidebarGroups = useMemo((): FoundationSuiteSidebarGroup[] => {
    if (sidebarGroupsProp?.length) return sidebarGroupsProp;
    return [{ label: navTitle, items: navItems }];
  }, [sidebarGroupsProp, navTitle, navItems]);

  const sectionIdsKey = shellRendersSectionChips ? "" : flatNavItems.map((item) => item.id).join("\0");
  const internalActiveSectionId = useActiveSectionInView(sectionIdsKey);
  const activeSectionId = shellRendersSectionChips ? shellActiveSectionId : internalActiveSectionId;

  return (
    <div
      className={`tab-page-with-section-nav ${className ?? ""}`.trim()}
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily: SUITE_FONT_UI,
      }}
    >
      {shellRendersSectionChips ? null : (
        <div style={SUITE_CHIP_CARD_STYLE}>
          <TabSectionMenu
            title={navTitle}
            items={flatNavItems}
            variant="chips"
            suiteChipCardEmbed
            description={chipsHint}
            activeSectionId={activeSectionId}
            showIcons={sectionNavIcons}
          />
        </div>
      )}
      <div className="flex w-full flex-col items-stretch gap-8 lg:flex-row lg:gap-10">
        <FoundationStyleSuiteSidebar groups={sidebarGroups} activeSectionId={activeSectionId} />
        <div className="tab-page-main min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
