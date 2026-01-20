export type SnapshotHistoryItem = {
  id: string;
  businessName: string;
  brandAlignmentScore: number;
  primaryPillar: string;
  createdAt: string;
  completed: boolean;
};

export function canResumeSnapshot(item: SnapshotHistoryItem) {
  return !item.completed;
}

export async function fetchSnapshotHistory(userId: string) {
  const res = await fetch(`/api/history?userId=${userId}`);
  return res.json() as Promise<SnapshotHistoryItem[]>;
}
