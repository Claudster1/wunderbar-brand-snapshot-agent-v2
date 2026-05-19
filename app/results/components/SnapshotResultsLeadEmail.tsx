"use client";

import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { persistEmail } from "@/lib/persistEmail";
import { setEmailMarketingOptInPreference } from "@/lib/smsConsent";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import type { SnapshotContentOptIn } from "@/lib/snapshot/snapshotContentOptIn";

type Props = {
  reportId: string;
  /** Matches `/api/snapshot/lead-email` productTier casing. */
  productTier: "snapshot" | "snapshot-plus";
  productName: string;
  firstNameHint?: string;
  /** Fired after email is saved — unlocks gated results content immediately. */
  onEmailCaptured?: () => void;
  /** True once full results are visible (email saved). */
  contentUnlocked?: boolean;
};

const INSIGHTS_CHOICES: Array<{ value: SnapshotContentOptIn; label: string }> = [
  { value: "marketing_trends", label: "Marketing trends & brand strategy tips" },
  { value: "ai_updates", label: "AI tools & automation for business" },
  { value: "both", label: "Both — send me everything useful" },
  { value: "no_thanks", label: "No thanks — just the diagnostic" },
];

/**
 * Snapshot / Snapshot+ only: collect email after the hero score, then content preferences (same order as chat Q41, post-email).
 */
export function SnapshotResultsLeadEmail({
  reportId,
  productTier,
  productName,
  firstNameHint,
  onEmailCaptured,
  contentUnlocked = false,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "insights">("email");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    if (typeof window !== "undefined") {
      (window as unknown as { __turnstileToken?: string }).__turnstileToken = token;
    }
  }, []);

  const [email, setEmail] = useState("");
  const [contentOptIn, setContentOptIn] = useState<SnapshotContentOptIn | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Honeypot — humans never touch it (hidden, tabIndex=-1, autoComplete=off, off-screen),
  // bots that auto-fill all inputs will populate it. Server treats it as silent rejection.
  const [honeypot, setHoneypot] = useState("");

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      if (honeypot) {
        // Pretend success — bot gets no useful signal back.
        return;
      }
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
            turnstileToken,
            productTier,
            // Echo honeypot so the server can catch bots that bypass the client check.
            honeypot,
            ...(firstName ? { firstName } : {}),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not save. Please try again.");
          return;
        }
        persistEmail(trimmed);
        onEmailCaptured?.();
        setStep("insights");
        setContentOptIn(null);
        setError(null);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [email, firstNameHint, honeypot, onEmailCaptured, reportId, productTier, turnstileToken],
  );

  const handleInsightsSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!contentOptIn) {
        setError("Choose one option above.");
        return;
      }
      if (!turnstileToken) {
        setError("Security check is still loading — wait a second and try again.");
        return;
      }
      const trimmed = email.trim().toLowerCase();
      if (!trimmed.includes("@")) {
        setError("Something went wrong — go back and re-enter your email.");
        return;
      }

      setSaving(true);
      try {
        const res = await fetch("/api/snapshot/marketing-insights-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId,
            email: trimmed,
            contentOptIn,
            turnstileToken,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not save preference. Try again.");
          return;
        }
        setEmailMarketingOptInPreference(contentOptIn !== "no_thanks");
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [contentOptIn, email, reportId, router, turnstileToken],
  );

  return (
    <section
      className="results-lead-email-panel scroll-mt-28"
      aria-label="Email for full diagnostic"
    >
      <TurnstileWidget onToken={handleTurnstileToken} />
      <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-[0.06em] text-sky-800">
        {contentUnlocked ? "One quick preference" : "Unlock your full diagnostic"}
      </p>

      {step === "email" ? (
        <>
          <h2 className="bs-h3 m-0 mb-2 text-brand-midnight">See your full {productName}</h2>
          <p className="bs-body-sm m-0 mb-5 max-w-2xl text-brand-muted leading-relaxed">
            Your WunderBrand Score™ is above. Enter your email to unlock pillar scores, priority actions, your
            archetype, and the rest of this report — then choose whether you want occasional brand tips (optional).
          </p>
          <form onSubmit={handleEmailSubmit} className="max-w-md">
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
            {/* Honeypot — invisible to humans, bots auto-fill it. Same pattern as the chat form. */}
            <input
              type="text"
              name="company_url"
              value={honeypot}
              onChange={(ev) => setHoneypot(ev.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
            />
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
              {saving ? "Saving…" : "Unlock my results"}
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
        </>
      ) : (
        <>
          <h2 className="bs-h3 m-0 mb-2 text-brand-midnight">Almost done</h2>
          <p className="bs-body-sm m-0 mb-4 max-w-2xl text-brand-muted leading-relaxed">
            We share occasional insights to help businesses like yours stay ahead. Anything here sound useful?
          </p>
          <form onSubmit={handleInsightsSubmit} className="max-w-md">
            <fieldset className="m-0 mb-4 border-0 p-0">
              <legend className="sr-only">Email content preferences</legend>
              <div className="flex flex-col gap-2.5">
                {INSIGHTS_CHOICES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={
                      "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[14px] leading-snug " +
                      (contentOptIn === value
                        ? "border-[#07B0F2] bg-sky-50/80 text-slate-800"
                        : "border-slate-200 bg-white/80 text-slate-800")
                    }
                  >
                    <input
                      type="radio"
                      name="content-opt-in"
                      value={value}
                      checked={contentOptIn === value}
                      onChange={() => {
                        setContentOptIn(value);
                        setError(null);
                      }}
                      disabled={saving}
                      className="mt-1 size-[18px] shrink-0 accent-[#021859]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {error ? (
              <p className="m-0 mb-3 text-[13px] text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={saving || !contentOptIn}
              className="w-full rounded-lg border-0 bg-[#07B0F2] px-4 py-[14px] text-base font-extrabold text-white hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Saving…" : `Save & open my full ${productName}`}
            </button>
            <button
              type="button"
              className="mt-3 w-full border-0 bg-transparent text-[13px] font-semibold text-sky-700 underline"
              disabled={saving}
              onClick={() => {
                setStep("email");
                setError(null);
                setContentOptIn(null);
              }}
            >
              Back to email
            </button>
          </form>
        </>
      )}
    </section>
  );
}
