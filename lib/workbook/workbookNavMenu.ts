import type { ProductTier } from "@/components/ResultsTabNav";
import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import { PROMPT_SECTIONS_BY_PRODUCT_TIER } from "@/lib/promptPackData";
import { WORKBOOK_SECTIONS } from "@/lib/workbookTypes";

const TIER_RANK: Record<string, number> = {
  snapshot: 0,
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

const SECTION_TIER_RANK: Record<string, number> = {
  "snapshot-plus": 1,
  blueprint: 2,
  "blueprint-plus": 3,
};

/** Workbook section jump targets — shared by shell chips and `WorkbookTab`. */
export function buildWorkbookNavMenuItems(
  productTier: ProductTier,
  versionsLength: number,
): TabSectionMenuItem[] {
  const tierRank = TIER_RANK[productTier] ?? 0;
  function isSectionAvailable(availableFrom: string): boolean {
    return tierRank >= (SECTION_TIER_RANK[availableFrom] ?? 99);
  }
  const availableSections = WORKBOOK_SECTIONS.filter((section) => isSectionAvailable(section.availableFrom));
  const hasPromptLibrary = (PROMPT_SECTIONS_BY_PRODUCT_TIER[productTier] ?? []).length > 0;
  const items: TabSectionMenuItem[] = [
    { id: "workbook-overview", label: "Overview", icon: "OV" },
    { id: "workbook-diagnostic-truth", label: "Diagnostic Truth", icon: "DT" },
    ...availableSections.map((section) => ({
      id: `workbook-section-${section.id}`,
      label: section.label,
    })),
    ...(hasPromptLibrary ? [{ id: "workbook-prompt-library", label: "Prompt Library", icon: "PL" }] : []),
  ];
  if (versionsLength > 0) {
    items.push({ id: "workbook-version-history", label: "Version History", icon: "VH" });
  }
  return items;
}
