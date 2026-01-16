// components/dashboard/DashboardFilters.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function DashboardFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    value ? next.set(key, value) : next.delete(key);
    router.push(`/history?${next.toString()}`);
  }

  return (
    <div className="flex gap-4 mb-6">
      <input
        placeholder="Filter by brand name"
        className="border rounded px-3 py-2"
        onChange={(e) => update("brand", e.target.value)}
      />

      <select
        className="border rounded px-3 py-2"
        onChange={(e) => update("score", e.target.value)}
      >
        <option value="">All scores</option>
        <option value="80">80+</option>
        <option value="60">60–79</option>
        <option value="40">Below 60</option>
      </select>
    </div>
  );
}
