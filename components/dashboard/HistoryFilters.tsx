"use client";

import { HistoryFilter } from "@/lib/dashboard/history";

export function HistoryFilters({
  filter,
  onChange,
}: {
  filter: HistoryFilter;
  onChange: (f: HistoryFilter) => void;
}) {
  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Filter by brand"
        className="border px-3 py-2 rounded text-sm"
        value={filter.brand ?? ""}
        onChange={(e) => onChange({ ...filter, brand: e.target.value })}
      />

      <input
        type="number"
        placeholder="Min score"
        className="border px-3 py-2 rounded text-sm w-32"
        value={filter.minScore ?? ""}
        onChange={(e) =>
          onChange({ ...filter, minScore: Number(e.target.value) || undefined })
        }
      />

      <select
        className="border px-3 py-2 rounded text-sm"
        value={filter.sortBy ?? "date"}
        onChange={(e) =>
          onChange({ ...filter, sortBy: e.target.value as HistoryFilter["sortBy"] })
        }
      >
        <option value="date">Newest first</option>
        <option value="score">Highest score</option>
      </select>
    </div>
  );
}
