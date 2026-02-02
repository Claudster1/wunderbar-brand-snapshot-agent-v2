// components/dashboard/DashboardHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchSnapshotHistory } from "@/hooks/useSnapshotHistory";

export default function DashboardHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("brand_snapshot_email")
      : null;

  useEffect(() => {
    if (!email) return;

    fetchSnapshotHistory(email).then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, [email]);

  if (loading) return <p>Loading your snapshots…</p>;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold mb-6">Your Brand Snapshots</h1>

      {history.length === 0 && (
        <p className="text-slate-600">
          You haven’t completed a Brand Snapshot™ yet.
        </p>
      )}

      <ul className="space-y-4">
        {history.map((snap) => (
          <li
            key={snap.id}
            className="border border-brand-border rounded-lg p-6 bg-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{snap.brand_name}</h2>

                <p className="text-sm text-slate-600 mt-1">
                  Brand Alignment Score™:{" "}
                  <strong>{snap.brand_alignment_score}</strong>
                </p>

                <p className="text-sm mt-1">
                  Primary focus area:{" "}
                  <strong>{snap.primary_pillar}</strong>
                </p>
              </div>

              <a
                href={`/results/${snap.id}`}
                className="text-brand-blue text-sm hover:underline"
              >
                View Results →
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
