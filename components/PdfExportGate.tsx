// components/PdfExportGate.tsx
"use client";

import { trackEvent } from "@/lib/activeCampaignTracking";

export function PdfExportGate({
  hasAccess
}: {
  hasAccess: boolean;
}) {
  if (hasAccess) {
    return (
      <a
        href="/api/pdf/snapshot-plus"
        onClick={() => trackEvent("pdf_export_clicked", {})}
        className="btn-primary"
      >
        Download PDF →
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-brand-border p-4">
      <p className="text-sm mb-3">
        Want a downloadable version of this report?
      </p>
      <a
        href="/snapshot-plus"
        onClick={() =>
          trackEvent("pdf_export_upsell_clicked", {})
        }
        className="text-brand-blue font-medium hover:underline"
      >
        Unlock Snapshot+™ →
      </a>
    </div>
  );
}
