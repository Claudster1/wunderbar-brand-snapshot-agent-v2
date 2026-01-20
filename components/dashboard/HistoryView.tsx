import { SnapshotHistoryItem } from "@/lib/dashboard/historyTypes";

export function HistoryView({
  items,
}: {
  items: SnapshotHistoryItem[];
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Your Brand History</h2>

      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-5 flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{item.brandName}</h3>
            <p className="text-sm">
              Score: {item.brandAlignmentScore} · Focus: {item.primaryPillar}
            </p>
          </div>

          <div className="flex gap-3">
            <a href={`/results/${item.id}`} className="btn-secondary">
              View
            </a>

            {!item.hasSnapshotPlus && (
              <a href={`/snapshot-plus?from=${item.id}`} className="btn-primary">
                Deepen Insights →
              </a>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
