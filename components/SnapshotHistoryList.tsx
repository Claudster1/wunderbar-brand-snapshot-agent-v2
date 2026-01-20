import { SnapshotHistoryItem, canResumeSnapshot } from "@/lib/snapshotHistory";

type Props = {
  history: SnapshotHistoryItem[];
};

export function SnapshotHistoryList({ history }: Props) {
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{item.brandName}</p>
            <p className="text-sm text-gray-600">
              Score: {item.score}/100
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={`/results/${item.id}`}
              className="btn-secondary"
            >
              View results
            </a>

            {canResumeSnapshot(item) && (
              <a
                href={`/snapshot/${item.id}`}
                className="btn-primary"
              >
                Resume →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
