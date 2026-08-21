"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getTrackedCheckoutUrl } from "@/lib/checkoutUrls";

function SnapshotPlusEntryInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const baseReportId = searchParams.get("baseReportId") || searchParams.get("reportId");
    const url = getTrackedCheckoutUrl({
      product: "snapshot-plus",
      medium: "results_cta",
      content: "snapshot_plus_legacy_entry",
    });
    const dest = new URL(url, window.location.origin);
    if (baseReportId) {
      dest.searchParams.set("baseReportId", baseReportId);
    }
    window.location.replace(dest.pathname + dest.search);
  }, [searchParams]);

  return (
    <main className="min-h-[40vh] flex items-center justify-center px-4 font-brand">
      <p className="bs-body-sm text-brand-muted m-0">Taking you to Snapshot+™ checkout…</p>
    </main>
  );
}

/**
 * Legacy upgrade entry. Routes to Stripe checkout (then tier chat after payment)
 * instead of the old unstyled marketing stub.
 */
export default function SnapshotPlusEntryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[40vh] flex items-center justify-center px-4 font-brand">
          <p className="bs-body-sm text-brand-muted m-0">Taking you to Snapshot+™ checkout…</p>
        </main>
      }
    >
      <SnapshotPlusEntryInner />
    </Suspense>
  );
}
