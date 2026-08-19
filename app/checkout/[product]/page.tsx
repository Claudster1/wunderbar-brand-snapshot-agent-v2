"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getPersistedEmail } from "@/lib/persistEmail";
import {
  getEmailMarketingOptInPreference,
  getSmsOptInPreference,
} from "@/lib/smsConsent";

function CheckoutProductInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const raw = typeof params.product === "string" ? params.product : "";
      const productKey = raw.trim().toLowerCase().replace(/-/g, "_");
      if (!productKey || productKey === "brand_snapshot" || productKey === "snapshot") {
        setError("Choose a paid tier to continue.");
        return;
      }

      const baseReportId = searchParams.get("baseReportId") || searchParams.get("reportId") || "";
      const email = searchParams.get("email") || getPersistedEmail() || undefined;

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productKey,
            email,
            smsOptedIn: getSmsOptInPreference(),
            emailMarketingOptedIn: getEmailMarketingOptInPreference(),
            metadata: {
              ...(baseReportId ? { base_report_id: baseReportId } : {}),
              utm_source: searchParams.get("utm_source") || "wunderbar_app",
              utm_medium: searchParams.get("utm_medium") || "checkout",
              utm_campaign: searchParams.get("utm_campaign") || "",
              utm_content: searchParams.get("utm_content") || "",
            },
          }),
        });

        if (!res.ok) {
          throw new Error("Checkout failed");
        }
        const data = (await res.json()) as { url?: string };
        if (!data.url) {
          throw new Error("No checkout URL");
        }
        if (!cancelled) {
          window.location.href = data.url;
        }
      } catch {
        if (!cancelled) {
          setError("Sorry — we couldn’t start checkout. Please try again.");
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [params.product, searchParams]);

  return (
    <main className="min-h-[50vh] flex items-center justify-center px-4 font-brand">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="bs-h3 text-brand-navy mb-3">Checkout unavailable</h1>
            <p className="bs-body-sm text-brand-muted mb-6">{error}</p>
            <a href="/brand-snapshot-suite" className="wb-cta wb-cta--solid">
              Compare the Suite™
            </a>
          </>
        ) : (
          <>
            <h1 className="bs-h3 text-brand-navy mb-3">Redirecting to secure checkout…</h1>
            <p className="bs-body-sm text-brand-muted m-0">
              After payment you’ll start a new diagnostic chat for your selected tier.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

/**
 * Starts Stripe Checkout for a paid tier, then returns users to
 * /checkout/success → tier-specific chat (`/?tier=…`).
 */
export default function CheckoutProductPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50vh] flex items-center justify-center px-4 font-brand">
          <p className="bs-body-sm text-brand-muted m-0">Redirecting to secure checkout…</p>
        </main>
      }
    >
      <CheckoutProductInner />
    </Suspense>
  );
}
