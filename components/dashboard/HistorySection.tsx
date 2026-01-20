"use client";

import { useMemo, useState } from "react";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryList } from "./HistoryList";
import {
  applyHistoryFilter,
  type HistoryFilter,
  type SnapshotHistoryItem,
} from "@/lib/dashboard/history";

type Props = {
  snapshots: any[];
};

export function HistorySection({ snapshots }: Props) {
  const [filter, setFilter] = useState<HistoryFilter>({ sortBy: "date" });

  const items = useMemo<SnapshotHistoryItem[]>(
    () =>
      snapshots.map((snapshot) => ({
        id: snapshot.id,
        brandName: snapshot.business_name ?? snapshot.brand_name ?? "Untitled",
        brandAlignmentScore: snapshot.brand_alignment_score ?? 0,
        primaryPillar: snapshot.primary_pillar ?? "positioning",
        createdAt: snapshot.created_at,
        hasSnapshotPlus: snapshot.has_snapshot_plus === true,
      })),
    [snapshots]
  );

  const filtered = useMemo(
    () => applyHistoryFilter(items, filter),
    [items, filter]
  );

  return (
    <>
      <HistoryFilters filter={filter} onChange={setFilter} />
      <HistoryList items={filtered} />
    </>
  );
}
