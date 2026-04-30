// components/dashboard/HistoryReminder.tsx
"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/activeCampaignTracking";
import Link from "next/link";

export function HistoryReminder() {
  const [show] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const completedAt = localStorage.getItem("snapshot_completed_at");
    const hasPaid = localStorage.getItem("has_paid_plan") === "true";

    if (!completedAt || hasPaid) return false;

    const daysSince =
      (Date.now() - Number(completedAt)) / (1000 * 60 * 60 * 24);
    return daysSince >= 7;
  });

  if (!show) return null;

  return (
    <div className="mt-6 rounded-lg border border-brand-border bg-brand-soft p-4">
      <p className="text-sm text-brand-midnight mb-2">
        Want a clearer plan based on these results?
      </p>
      <Link
        href="/snapshot-plus"
        onClick={() => trackEvent("history_soft_reminder_clicked", {})}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        View Snapshot+™ →
      </Link>
    </div>
  );
}
