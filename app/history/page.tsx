// app/history/page.tsx

import { getSnapshots } from "@/lib/getSnapshots";
import SnapshotHistoryCard from "@/components/SnapshotHistoryCard";

export default async function HistoryPage() {
  const snapshots = await getSnapshots();

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">
        Your Brand Snapshot™ History
      </h1>

      <div className="grid gap-4">
        {snapshots.map((snap) => (
          <SnapshotHistoryCard key={snap.id} snapshot={snap} />
        ))}
      </div>
    </div>
  );
}
