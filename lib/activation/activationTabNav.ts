import type { ScheduleRow } from "@/components/ExecutionSchedule";
import type { ProductTier } from "@/components/ResultsTabNav";
import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import { filterActivationPlanSections } from "@/components/results/tabConfig";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import {
  activationNavLabel,
  isActivationNavChannelId,
  sortActivationSectionsForNav,
} from "@/lib/activation/activationNavModel";
import {
  activationPromptLibraryDomId,
  hasActivationPromptLibrary,
} from "@/lib/activation/activationPromptLibrary";
import {
  filterBlueprintPlusGuidedActivationNavItems,
  filterBlueprintPlusGuidedActivationSections,
  resolveBlueprintPlusGuidedActivationSectionIds,
  type BlueprintPlusViewMode,
} from "@/lib/results/blueprintPlusGuidedMode";

/**
 * Activation section jump targets — shared by `ResultsTabsShell` (chips) and `ActivationTab` (sidebar + body).
 *
 * Order: Overview → Buyer journey (+ context) → 90-day roadmap → Schedule → Channels → Prompts
 */
export function buildActivationNavMenuItems(
  productTier: ProductTier,
  diagnosticData: Record<string, unknown>,
  scheduleRows: ScheduleRow[],
  _activationFocusSearchParam: string | null,
  blueprintPlusViewMode: BlueprintPlusViewMode = "reference",
): TabSectionMenuItem[] {
  const guided =
    productTier === "blueprint-plus" && blueprintPlusViewMode === "guided";
  const activationPlanSections = buildActivationPlanSectionsList(diagnosticData, scheduleRows.length);
  const activationPlanSectionsVisible = filterBlueprintPlusGuidedActivationSections(
    filterActivationPlanSections(productTier, activationPlanSections),
    guided ? "guided" : "reference",
    diagnosticData,
  );

  const preferredChannelOrder = guided
    ? resolveBlueprintPlusGuidedActivationSectionIds(diagnosticData).filter((id) =>
        isActivationNavChannelId(id),
      )
    : undefined;

  const ordered = sortActivationSectionsForNav(
    activationPlanSectionsVisible,
    preferredChannelOrder,
  );

  const items: TabSectionMenuItem[] = [{ id: "activation-overview", label: "Overview", icon: "OV" }];

  let channelsHeadingAdded = false;
  for (const section of ordered) {
    if (isActivationNavChannelId(section.id) && !channelsHeadingAdded) {
      items.push({
        id: "activation-nav-channels",
        label: "Channels",
        kind: "heading",
      });
      channelsHeadingAdded = true;
    }
    items.push({
      id: `activation-${section.id}`,
      label: activationNavLabel(section.id, section.label),
    });
  }

  // Schedule sits with the roadmap family: insert after roadmap item when present, else before channels.
  if (scheduleRows.length > 0) {
    const scheduleItem: TabSectionMenuItem = {
      id: "activation-spreadsheet-schedule",
      label: "Schedule",
      icon: "SC",
    };
    const roadmapIdx = items.findIndex((i) => i.id === "activation-execution-roadmap");
    const channelsIdx = items.findIndex((i) => i.id === "activation-nav-channels");
    if (roadmapIdx >= 0) {
      items.splice(roadmapIdx + 1, 0, scheduleItem);
    } else if (channelsIdx >= 0) {
      items.splice(channelsIdx, 0, scheduleItem);
    } else {
      items.push(scheduleItem);
    }
  }

  if (hasActivationPromptLibrary(productTier)) {
    items.push({
      id: activationPromptLibraryDomId(),
      label: "Prompts",
      icon: "PL",
    });
  }

  const filtered = filterBlueprintPlusGuidedActivationNavItems(
    items,
    guided ? "guided" : "reference",
    diagnosticData,
  );

  // Drop orphaned "Channels" heading when Guided filters out every channel (shouldn't happen).
  return filtered.filter((item, index, arr) => {
    if (item.id !== "activation-nav-channels") return true;
    const next = arr[index + 1];
    return Boolean(next && next.kind !== "heading" && next.id.startsWith("activation-") && isActivationNavChannelId(next.id.slice("activation-".length)));
  });
}
