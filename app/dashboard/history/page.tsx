// app/dashboard/history/page.tsx
import { getUserSnapshots } from "@/lib/getUserSnapshots";
import { SnapshotRow } from "@/components/dashboard/SnapshotRow";
import { cookies } from "next/headers";

export default async function HistoryPage() {
  // In a production auth system, get email from session/token.
  // For now, read from cookie or return empty results.
  const cookieStore = await cookies();
  const email = cookieStore.get("user_email")?.value ?? null;
  const snapshots = await getUserSnapshots(email);

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
