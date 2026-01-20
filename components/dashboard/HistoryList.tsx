import { SnapshotHistoryItem } from "@/lib/dashboard/history";
import { UpgradeNudge } from "@/components/results/UpgradeNudge";
import { useRouter } from "next/navigation";

export function HistoryList({
  items,
}: {
  items: SnapshotHistoryItem[];
}) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{item.brandName}</div>
              <div className="text-sm text-gray-600">
                Score: {item.brandAlignmentScore} · Focus: {item.primaryPillar}
              </div>
            </div>

            {!item.hasSnapshotPlus && (
              <button
                onClick={() => router.push(`/brand-snapshot?resume=${item.id}`)}
                className="text-sm text-brand-blue"
              >
                Resume →
              </button>
            )}
          </div>

          {!item.hasSnapshotPlus && (
            <UpgradeNudge
              primaryPillar={item.primaryPillar}
              hasSnapshotPlus={false}
            />
          )}
        </div>
      ))}
    </div>
  );
}
