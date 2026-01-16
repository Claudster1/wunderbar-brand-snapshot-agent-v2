// components/dashboard/HistoryReminder.tsx
"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/activeCampaignTracking";

export function HistoryReminder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const completedAt = localStorage.getItem("snapshot_completed_at");
    const hasPaid = localStorage.getItem("has_paid_plan") === "true";

    if (!completedAt || hasPaid) return;

    const daysSince =
      (Date.now() - Number(completedAt)) / (1000 * 60 * 60 * 24);

    if (daysSince >= 7) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="mt-6 rounded-lg border border-brand-border bg-brand-soft p-4">
      <p className="text-sm text-brand-midnight mb-2">
        Want a clearer plan based on these results?
      </p>
      <a
        href="/snapshot-plus"
        onClick={() => trackEvent("history_soft_reminder_clicked", {})}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        View Snapshot+™ →
      </a>
    </div>
  );
}
