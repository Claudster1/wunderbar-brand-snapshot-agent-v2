import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";

export interface BuildResultsTabNavItemsParams {
  hasSnapshotPlusAccess: boolean;
}

/** Section jump chips for the Results tab — ids must match anchors in `app/results/page.tsx`. */
export function buildResultsTabNavItems({
  hasSnapshotPlusAccess,
}: BuildResultsTabNavItemsParams): TabSectionMenuItem[] {
  const items: TabSectionMenuItem[] = [
    { id: "results-overview", label: "Overview", icon: "OV" },
    { id: "results-visual-summary", label: "Charts", icon: "CH" },
  ];

  if (!hasSnapshotPlusAccess) {
    items.push({ id: "diagnostic-signals", label: "Signals", icon: "DT" });
  }

  items.push(
    { id: "pillar-analysis", label: "Pillar Analysis", icon: "BP" },
    { id: "priority-actions", label: "Priority Actions", icon: "PA" },
  );

  if (!hasSnapshotPlusAccess) {
    items.push({ id: "snapshot-plus-preview", label: "Snapshot+ Preview", icon: "LD" });
  }

  items.push(
    { id: "context-coverage", label: "Context", icon: "CC" },
    { id: "implementation", label: "Implementation", icon: "IM" },
    { id: "next-steps", label: "Next Steps", icon: "NS" },
  );

  return items;
}
