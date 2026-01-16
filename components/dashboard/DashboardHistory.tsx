// components/dashboard/DashboardHistory.tsx
"use client";

import { useState } from "react";
import { HistoryCard } from "./HistoryCard";

type HistoryItem = {
  id: string;
  brandName: string;
  score: number;
  primaryPillar: string;
  createdAt: string;
};

export function DashboardHistory({
  items
}: {
  items: HistoryItem[];
}) {
  const [sort, setSort] = useState<"date" | "score">("date");

  const sorted = [...items].sort((a, b) =>
    sort === "date"
      ? new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      : b.score - a.score
  );

  return (
    <section>
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setSort("date")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            sort === "date"
              ? "bg-brand-blue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Most recent
        </button>
        <button 
          onClick={() => setSort("score")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            sort === "score"
              ? "bg-brand-blue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Highest score
        </button>
      </div>

      <div className="space-y-4">
        {sorted.map(item => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
