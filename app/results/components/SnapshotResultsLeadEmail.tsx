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
  const [honeypot, setHoneypot] = useState("");

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      if (honeypot) {
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
    <section className="results-gate-capture" aria-label="Email for full diagnostic">
      <TurnstileWidget onToken={handleTurnstileToken} />

      <div className="results-gate-capture__hero">
        <div className="results-gate-capture__hero-glow" aria-hidden />
        <p className="results-gate-capture__eyebrow">
          {contentUnlocked ? "One quick preference" : "Unlock your full diagnostic"}
        </p>
        {step === "email" ? (
          <>
            <h2 className="results-gate-capture__title">See your full {productName}</h2>
            <p className="results-gate-capture__lead">
              Your WunderBrand Score™ is above. Enter your email to unlock pillar scores, priority actions,
              your archetype, and the rest of this report.
            </p>
          </>
        ) : (
          <>
            <h2 className="results-gate-capture__title">Almost done</h2>
            <p className="results-gate-capture__lead">
              Optional: choose whether you want occasional brand tips — then your full report opens instantly.
            </p>
          </>
        )}
      </div>

      <div className="results-gate-capture__body">
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="results-gate-capture__form">
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
              className="results-gate-capture__input"
            />
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
              <p className="results-gate-capture__error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={saving || !email.trim()}
              className="results-gate-capture__submit"
            >
              {saving ? "Saving…" : "Unlock my results"}
            </button>
            <p className="results-gate-capture__legal">
              We use your email to deliver this diagnostic and save your links.{" "}
              <a
                href="https://wunderbardigital.com/privacy-policy?utm_source=results_page&utm_medium=lead_email&utm_campaign=privacy&utm_content=privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleInsightsSubmit} className="results-gate-capture__form">
            <fieldset className="results-gate-capture__fieldset">
              <legend className="sr-only">Email content preferences</legend>
              <div className="results-gate-capture__choices">
                {INSIGHTS_CHOICES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={
                      "results-gate-capture__choice" +
                      (contentOptIn === value ? " results-gate-capture__choice--selected" : "")
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
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {error ? (
              <p className="results-gate-capture__error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={saving || !contentOptIn}
              className="results-gate-capture__submit"
            >
              {saving ? "Saving…" : `Save & open my full ${productName}`}
            </button>
            <button
              type="button"
              className="results-gate-capture__back"
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
        )}
      </div>
    </section>
  );
}
