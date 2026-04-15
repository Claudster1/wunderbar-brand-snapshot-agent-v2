import type { ScheduleRow } from "@/components/ExecutionSchedule";
import type { ProductTier } from "@/components/ResultsTabNav";
import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import { filterActivationPlanSections } from "@/components/results/tabConfig";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import {
  filterActivationSectionsByTabFocus,
  parseActivationTabFocus,
  splitActivationSectionsByAudienceVsCampaign,
  type ActivationTabFocus,
} from "@/lib/activation/activationPlanAudienceVsCampaign";

function clampActivationFocus(
  focus: ActivationTabFocus,
  showToggle: boolean,
  audienceCount: number,
  campaignCount: number,
): ActivationTabFocus {
  if (!showToggle) return "campaigns";
  if (focus === "audience-journey" && audienceCount === 0) return "campaigns";
  if (focus === "campaigns" && campaignCount === 0) return "audience-journey";
  return focus;
}

/**
 * Activation section jump targets — shared by `ResultsTabsShell` (chips) and `ActivationTab` (sidebar + body).
 */
export function buildActivationNavMenuItems(
  productTier: ProductTier,
  diagnosticData: Record<string, unknown>,
  scheduleRows: ScheduleRow[],
  activationFocusSearchParam: string | null,
): TabSectionMenuItem[] {
  const activationPlanSections = buildActivationPlanSectionsList(diagnosticData, scheduleRows.length);
  const activationPlanSectionsVisible = filterActivationPlanSections(productTier, activationPlanSections);
  const { audienceJourney, campaigns: campaignSections } = splitActivationSectionsByAudienceVsCampaign(
    activationPlanSectionsVisible,
  );
  const showFoundationCampaignToggle = audienceJourney.length > 0 && campaignSections.length > 0;
  const parsed = parseActivationTabFocus(activationFocusSearchParam);
  const activationFocus = clampActivationFocus(
    parsed,
    showFoundationCampaignToggle,
    audienceJourney.length,
    campaignSections.length,
  );
  const sectionsForTable = !showFoundationCampaignToggle
    ? activationPlanSectionsVisible
    : filterActivationSectionsByTabFocus(activationPlanSectionsVisible, activationFocus);

  const items: TabSectionMenuItem[] = [{ id: "activation-overview", label: "Overview", icon: "OV" }];
  for (const section of sectionsForTable) {
    items.push({ id: `activation-${section.id}`, label: section.label });
  }
  if ((!showFoundationCampaignToggle || activationFocus === "campaigns") && scheduleRows.length > 0) {
    items.push({ id: "activation-spreadsheet-schedule", label: "Schedule (.xlsx)", icon: "SC" });
  }
  return items;
}
