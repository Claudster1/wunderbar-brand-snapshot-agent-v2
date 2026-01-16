// app/dashboard/history/page.tsx
import { getUserSnapshots } from "@/lib/getUserSnapshots";
import { SnapshotRow } from "@/components/dashboard/SnapshotRow";

export default async function HistoryPage() {
  const snapshots = await getUserSnapshots();

  return (
    <section className="max-w-5xl mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">Your Brand Snapshots™</h1>

      <div className="space-y-4">
        {snapshots.map((s) => (
          <SnapshotRow key={s.id} snapshot={s} />
        ))}
      </div>
    </section>
  );
}
