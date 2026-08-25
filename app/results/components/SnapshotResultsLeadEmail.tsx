"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
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
  resultsEmailGatePreferenceSaveLabel,
  resultsEmailGatePreferenceSkipLabel,
  resultsEmailGateUnlockLegal,
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
  /** Fired when tips is saved or skipped — parent can show suite upsell + refresh. */
  onCaptureFlowComplete?: () => void;
  /**
   * Parent will hard-navigate (e.g. reload) after tips — skip router.refresh()
   * and show a calm “opening results” state instead of flashing RSC/payload UI.
   */
  parentHandlesNavigation?: boolean;
};

const INSIGHTS_CHOICES: Array<{ value: SnapshotContentOptIn; label: string }> = [
  { value: "marketing_trends", label: "Marketing trends & brand strategy tips" },
  { value: "ai_updates", label: "AI tools & automation for business" },
  { value: "both", label: "Both — send me everything useful" },
  { value: "no_thanks", label: "No thanks — just the diagnostic" },
];

const TURNSTILE_REQUIRED = isTurnstileEnforced();

type Phase = "unlock" | "tips" | "hidden" | "opening";

export function SnapshotResultsLeadEmail({
  reportId,
  productTier,
  productName,
  firstNameHint,
  onEmailCaptured,
  contentUnlocked = false,
  onCaptureFlowComplete,
  parentHandlesNavigation = false,
}: Props) {
  const router = useRouter();
  // Returning visitors who already unlocked: no second form. Tips only appear
  // immediately after a fresh email unlock in this session.
  const [phase, setPhase] = useState<Phase>(contentUnlocked ? "hidden" : "unlock");
  const unlockedViaEmailSubmitRef = useRef(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  /** Bumps Turnstile remount after a consumed/failed token so the next submit gets a fresh challenge. */
  const [turnstileEpoch, setTurnstileEpoch] = useState(0);
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

  useEffect(() => {
    // Session restore / returning visitor — hide Access without skipping a fresh unlock→tips flow.
    if (contentUnlocked && phase === "unlock" && !unlockedViaEmailSubmitRef.current) {
      setPhase("hidden");
    }
  }, [contentUnlocked, phase]);

  const finishCaptureFlow = useCallback(() => {
    onCaptureFlowComplete?.();
    if (parentHandlesNavigation) {
      // Hard reload is coming — keep a calm status card; do not soft-refresh (RSC flash).
      setPhase("opening");
      return;
    }
    setPhase("hidden");
    // Defer soft refresh until after the tips → upsell paint so RSC streaming
    // doesn't flash payload/“code” UI over the preference form.
    window.setTimeout(() => {
      router.refresh();
    }, 150);
  }, [onCaptureFlowComplete, parentHandlesNavigation, router]);

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
        unlockedViaEmailSubmitRef.current = true;
        onEmailCaptured?.();
        // Lead-email consumed this Turnstile token — tips needs a fresh one.
        setTurnstileToken(null);
        if (typeof window !== "undefined") {
          delete (window as unknown as { __turnstileToken?: string }).__turnstileToken;
        }
        setTurnstileEpoch((n) => n + 1);
        setPhase("tips");
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
        setError("Something went wrong — refresh and unlock again.");
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
          // Consumed/invalid token — remount widget via phase key bounce if still on tips.
          setTurnstileToken(null);
          if (typeof window !== "undefined") {
            delete (window as unknown as { __turnstileToken?: string }).__turnstileToken;
          }
          setTurnstileEpoch((n) => n + 1);
          return;
        }
        setEmailMarketingOptInPreference(contentOptIn !== "no_thanks");
        finishCaptureFlow();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [contentOptIn, email, finishCaptureFlow, reportId, turnstileToken],
  );

  if (phase === "hidden") return null;

  if (phase === "opening") {
    return (
      <section className="results-gate-capture" aria-live="polite" aria-busy="true">
        <div className="results-gate-capture__inner" style={{ textAlign: "center", padding: "28px 20px" }}>
          <p className="results-gate-capture__eyebrow m-0 mb-2">ALMOST THERE</p>
          <h2 className="bs-h3 m-0 mb-2 text-brand-navy">Opening your full diagnostic…</h2>
          <p className="results-gate-capture__lead m-0">Hang tight — this only takes a moment.</p>
        </div>
      </section>
    );
  }

  if (phase === "tips") {
    return (
      <section className="results-gate-capture" aria-label="Stay current with brand tips">
        <TurnstileWidget key={`tips-${turnstileEpoch}`} onToken={handleTurnstileToken} />
        <div className="results-gate-capture__inner">
          <header className="results-gate-capture__header results-gate-capture__offer">
            <p className="results-gate-capture__eyebrow m-0 mb-2">
              {resultsEmailGatePreferenceEyebrow()}
            </p>
            <h2 className="bs-h3 m-0 mb-2 text-brand-navy">
              {resultsEmailGatePreferenceHeadline()}
            </h2>
            <p className="results-gate-capture__lead m-0">{resultsEmailGatePreferenceLead()}</p>
          </header>

          <form onSubmit={handleInsightsSubmit} className="results-gate-capture__form">
            <fieldset className="results-gate-capture__fieldset">
              <legend className="sr-only">What to stay current on</legend>
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
              {saving ? "Saving…" : resultsEmailGatePreferenceSaveLabel()}
            </button>
            <button
              type="button"
              className="results-gate-capture__back"
              disabled={saving}
              onClick={() => finishCaptureFlow()}
            >
              {resultsEmailGatePreferenceSkipLabel()}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section
      className="results-gate-capture results-gate-capture--unlock"
      aria-label="Email for full diagnostic"
    >
      <TurnstileWidget key={`unlock-${turnstileEpoch}`} onToken={handleTurnstileToken} />
      <div className="results-gate-capture__inner">
        <div className="results-gate-capture__offer">
          <p className="results-gate-capture__eyebrow m-0">{resultsEmailGateIncludedEyebrow()}</p>
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
        </div>

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
            {resultsEmailGateUnlockLegal()}{" "}
            <a
              href="https://wunderbardigital.com/privacy-policy?utm_source=results_page&utm_medium=lead_email&utm_campaign=privacy&utm_content=privacy_policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}
