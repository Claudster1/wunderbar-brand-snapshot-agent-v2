"use client";

import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { persistEmail } from "@/lib/persistEmail";
import { setEmailMarketingOptInPreference } from "@/lib/smsConsent";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";

type Props = {
  reportId: string;
  /** Matches `/api/snapshot/lead-email` productTier casing. */
  productTier: "snapshot" | "snapshot-plus";
  productName: string;
  firstNameHint?: string;
};

/**
 * Snapshot / Snapshot+ only: collect email after the hero score so CRM + report association match the old chat teaser funnel.
 */
export function SnapshotResultsLeadEmail({ reportId, productTier, productName, firstNameHint }: Props) {
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    if (typeof window !== "undefined") {
      (window as unknown as { __turnstileToken?: string }).__turnstileToken = token;
    }
  }, []);

  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim().toLowerCase();
      if (!trimmed.includes("@")) {
        setError("Enter a valid email address.");
        return;
      }
      if (!turnstileToken) {
        setError("Security check is still loading — wait a second and try again.");
        return;
      }

      setSaving(true);
      try {
        const firstName =
          typeof firstNameHint === "string" && firstNameHint.trim()
            ? firstNameHint.trim().split(/\s+/)[0]
            : undefined;

        const res = await fetch("/api/snapshot/lead-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId,
            email: trimmed,
            marketingOptIn,
            turnstileToken,
            productTier,
            ...(firstName ? { firstName } : {}),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not save. Please try again.");
          return;
        }
        persistEmail(trimmed);
        setEmailMarketingOptInPreference(marketingOptIn);
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [email, marketingOptIn, firstNameHint, reportId, productTier, router, turnstileToken],
  );

  return (
    <section
      className="scroll-mt-28 rounded-xl border-2 border-[#07B0F2]/40 bg-gradient-to-b from-[#f0f9ff] to-white px-5 py-5 shadow-[0_8px_28px_rgba(7,176,242,0.12)] sm:px-6 sm:py-6"
      aria-label="Email for full diagnostic"
    >
      <TurnstileWidget onToken={handleTurnstileToken} />
      <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-[0.06em] text-sky-800">
        Finish saving your diagnostic
      </p>
      <h2 className="bs-h3 m-0 mb-2 text-brand-midnight">Get your complete {productName}</h2>
      <p className="bs-body-sm m-0 mb-5 max-w-2xl text-brand-muted leading-relaxed">
        Your score summary is above. Add your email so we can link this report to you, send access links,
        and (if you choose) occasional brand insights.
      </p>
      <form onSubmit={handleSubmit} className="max-w-md">
        <label htmlFor="results-lead-email" className="sr-only">
          Email for complete results
        </label>
        <input
          id="results-lead-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="done"
          value={email}
          onChange={(ev) => {
            setEmail(ev.target.value);
            setError(null);
          }}
          placeholder="you@company.com"
          disabled={saving}
          className="mb-3 w-full box-border rounded-lg border border-slate-300 px-[14px] py-3 text-[15px]"
        />
        <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-slate-600">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(ev) => setMarketingOptIn(ev.target.checked)}
            disabled={saving}
            className="mt-0.5 size-[18px] shrink-0 accent-[#021859]"
          />
          <span>
            Yes — include me on occasional brand &amp; marketing tips by email (recommended). Uncheck for
            diagnostic-only email. Unsubscribe anytime.
          </span>
        </label>
        {error ? (
          <p className="m-0 mb-3 text-[13px] text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving || !email.trim()}
          className="w-full rounded-lg border-0 bg-[#07B0F2] px-4 py-[14px] text-base font-extrabold text-white hover:brightness-105 disabled:cursor-wait disabled:bg-slate-400"
        >
          {saving ? "Saving…" : `Email my complete ${productName}`}
        </button>
        <p className="mt-3 m-0 text-[11px] leading-snug text-slate-500">
          We use your email to deliver this diagnostic and save your links.{" "}
          <a
            href="https://wunderbardigital.com/privacy-policy?utm_source=results_page&utm_medium=lead_email&utm_campaign=privacy&utm_content=privacy_policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-600"
          >
            Privacy Policy
          </a>
        </p>
      </form>
    </section>
  );
}
