// components/PdfExportGate.tsx
"use client";

import { trackEvent } from "@/lib/activeCampaignTracking";
import Link from "next/link";
import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

export function PdfExportGate({
  hasAccess
}: {
  hasAccess: boolean;
}) {
  if (hasAccess) {
    return (
      <Link
        href="/preview/pdf"
        onClick={() => trackEvent("pdf_export_clicked", {})}
        className="btn-primary"
      >
        Download PDF →
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-brand-border p-4">
      <p className="text-sm mb-3">
        Want a downloadable version of this report?
      </p>
      <Link
        href={getTrackedCheckoutUrl({
          product: "snapshot-plus",
          medium: "results_cta",
          content: "pdf_export_gate",
        })}
        onClick={() =>
          trackEvent("pdf_export_upsell_clicked", {})
        }
        className="text-brand-blue font-medium hover:underline"
      >
        Take it further with Snapshot+™ →
      </Link>
    </div>
  );
}
