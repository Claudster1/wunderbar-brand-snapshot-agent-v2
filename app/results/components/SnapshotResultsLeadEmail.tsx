"use client";

import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ResultsCheckIcon } from "@/components/results/BrandIcons";
import { persistEmail } from "@/lib/persistEmail";
import { setEmailMarketingOptInPreference } from "@/lib/smsConsent";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import {
  RESULTS_EMAIL_GATE_UNLOCK_ITEMS,
  resultsCompleteSnapshotCtaLabel,
  resultsCompleteSnapshotHeadline,
  resultsEmailGateIncludedEyebrow,
  resultsEmailGatePreferenceEyebrow,
  resultsEmailGatePreferenceHeadline,
  resultsEmailGatePreferenceLead,
} from "@/lib/copy/resultsEmailGateCopy";
import type { SnapshotContentOptIn } from "@/lib/snapshot/snapshotContentOptIn";
import { isTurnstileEnforced } from "@/lib/security/turnstilePolicy";

type Props = {
  reportId: string;
  productTier: "snapshot" | "snapshot-plus";
  productName: string;
  firstNameHint?: string;
  onEmailCaptured?: () => void;
  contentUnlocked?: boolean;
};

const INSIGHTS_CHOICES: Array<{ value: SnapshotContentOptIn; label: string }> = [
  { value: "marketing_trends", label: "Marketing trends & brand strategy tips" },
  { value: "ai_updates", label: "AI tools & automation for business" },
  { value: "both", label: "Both — send me everything useful" },
  { value: "no_thanks", label: "No thanks — just the diagnostic" },
];

const TURNSTILE_REQUIRED = isTurnstileEnforced();

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
      if (honeypot) return;
      const trimmed = email.trim().toLowerCase();
      if (!trimmed.includes("@")) {
        setError("Enter a valid email address.");
        return;
      }
      if (TURNSTILE_REQUIRED && !turnstileToken) {
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
      if (TURNSTILE_REQUIRED && !turnstileToken) {
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

  const showUnlockOffer = step === "email" && !contentUnlocked;

  return (
    <section
      className={
        "results-gate-capture" + (showUnlockOffer ? " results-gate-capture--unlock" : "")
      }
      aria-label="Email for full diagnostic"
    >
      <TurnstileWidget onToken={handleTurnstileToken} />
      <div className="results-gate-capture__inner">
        <div className="results-gate-capture__offer">
          {showUnlockOffer ? (
            <>
              <p className="results-gate-capture__eyebrow m-0">
                {resultsEmailGateIncludedEyebrow()}
              </p>
              <h2 className="bs-h3 m-0 results-gate-capture__title">
                {resultsCompleteSnapshotHeadline(productName)}
              </h2>
              <ul className="results-gate-capture__list">
                {RESULTS_EMAIL_GATE_UNLOCK_ITEMS.map((label) => (
                  <li key={label}>
                    <ResultsCheckIcon />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <header className="results-gate-capture__header">
              <p className="results-gate-capture__eyebrow m-0 mb-2">
                {resultsEmailGatePreferenceEyebrow()}
              </p>
              <h2 className="bs-h3 m-0 mb-2 text-brand-navy">
                {resultsEmailGatePreferenceHeadline()}
              </h2>
              <p className="results-gate-capture__lead m-0">{resultsEmailGatePreferenceLead()}</p>
            </header>
          )}
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="results-gate-capture__form">
            <label htmlFor="results-lead-email" className="results-gate-capture__field-label">
              Work email
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
              disabled={saving}
              className="wb-cta wb-cta--solid wb-cta--block results-gate-capture__submit"
            >
              {saving ? "Saving…" : resultsCompleteSnapshotCtaLabel()}
            </button>
            <p className="results-gate-capture__legal">
              We’ll unlock your report on this page and email you a copy with your saved links.{" "}
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
              className="wb-cta wb-cta--solid wb-cta--block results-gate-capture__submit"
            >
              {saving ? "Saving…" : "Save preference"}
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
              Change email
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
