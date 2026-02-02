export type SnapshotHistoryItem = {
  id: string;
  brandName: string;
  brandAlignmentScore: number;
  primaryPillar: string;
  createdAt: string;
  hasSnapshotPlus: boolean;
};

export type HistoryFilter = {
  brand?: string;
  minScore?: number;
  sortBy?: "date" | "score";
};

export function applyHistoryFilter(
  items: SnapshotHistoryItem[],
  filter: HistoryFilter
) {
  let results = [...items];

  if (filter.brand) {
    const brand = filter.brand.toLowerCase();
    results = results.filter((i) =>
      i.brandName.toLowerCase().includes(brand)
    );
  }

  if (filter.minScore != null) {
    const minScore = filter.minScore;
    results = results.filter((i) => i.brandAlignmentScore >= minScore);
  }

  results.sort((a, b) => {
    if (filter.sortBy === "score") {
      return b.brandAlignmentScore - a.brandAlignmentScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return results;
}
