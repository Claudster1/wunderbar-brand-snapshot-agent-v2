"use client";

// components/security/EmailVerificationGate.tsx
//
// Full-screen overlay shown after the assessment completes but before results are revealed
// (Blueprint / Blueprint+ tiers — Snapshot has its own gate-less component on the results page).
//
// Flow today: email entry → marketing insights choice → results unlock.
//
// History: this used to be a 3-step flow with a 6-digit OTP between email and insights. The OTP
// was dropped because (a) the production DB never received the `email_verified` migration so the
// gate it backed was a no-op anyway, (b) the OTP step had a 15–35% drop-off and was the largest
// single source of lead loss in the funnel. We still POST to /api/verify-email/send (with
// `skipOtp: true`) because it carries the SMS / marketing opt-in side-effects that haven't been
// migrated to /api/snapshot/lead-email yet.

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import {
  getSmsOptInPreference,
  setSmsOptInPreference,
  setEmailMarketingOptInPreference,
} from "@/lib/smsConsent";
import { TurnstileWidget } from "@/components/security/TurnstileWidget";
import type { SnapshotContentOptIn } from "@/lib/snapshot/snapshotContentOptIn";

interface EmailVerificationGateProps {
  reportId: string;
  onVerified: (email: string) => void;
  /** Pre-filled email if already collected (e.g., from save-and-exit) */
  initialEmail?: string;
  /** Product label for unlock copy (e.g. WunderBrand Snapshot™). */
  productName?: string;
}

export function EmailVerificationGate({
  reportId,
  onVerified,
  initialEmail = "",
  productName = "WunderBrand Snapshot™",
}: EmailVerificationGateProps) {
  const [step, setStep] = useState<"email" | "insights">("email");
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [smsOptedIn, setSmsOptedIn] = useState<boolean>(() => getSmsOptInPreference());
  const [phoneMobile, setPhoneMobile] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [contentOptIn, setContentOptIn] = useState<SnapshotContentOptIn | null>(null);
  // Honeypot: invisible to humans, bots auto-fill. Same pattern as the chat home + lead-email form.
  const [honeypot, setHoneypot] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleTurnstile = useCallback((token: string) => {
    setTurnstileToken(token);
    if (typeof window !== "undefined") {
      (window as unknown as { __turnstileToken?: string }).__turnstileToken = token;
    }
  }, []);

  // Pre-fill when parent passes a known email (e.g. save-and-exit or local persistence).
  useEffect(() => {
    const next = initialEmail?.trim();
    if (next) setEmail(next);
  }, [initialEmail, reportId]);

  // Auto-focus email input on mount; cleanup abort controller on unmount
  useEffect(() => {
    emailRef.current?.focus();
    return () => { abortRef.current?.abort(); };
  }, []);

  const normalizePhoneToE164 = useCallback((input: string): string => {
    const cleaned = input.trim().replace(/[^\d+]/g, "");
    if (!cleaned) return "";
    if (cleaned.startsWith("+")) {
      return /^\+[1-9]\d{7,14}$/.test(cleaned) ? cleaned : "";
    }
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return "";
  }, []);

  /**
   * Save the email + SMS / marketing intent and unlock the insights step. POSTs to
   * /api/verify-email/send with `skipOtp: true` — that route still owns the SMS opt-in and
   * marketing intent side-effects, just without the 6-digit code branch.
   */
  const captureEmail = useCallback(async (
    emailToCapture: string,
    includeSmsOptIn: boolean,
    mobilePhone?: string,
  ) => {
    if (loading) return false;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToCapture,
          reportId,
          smsOptedIn: includeSmsOptIn,
          // Marketing opt-in is captured in the next step (`insights`) — not here.
          emailMarketingOptedIn: false,
          phoneMobile: mobilePhone || null,
          honeypot,
          skipOtp: true,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (controller.signal.aborted) return false;
      if (!res.ok) {
        setError(data.error || "Failed to save email.");
        setLoading(false);
        return false;
      }
      setLoading(false);
      return true;
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return false;
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return false;
    }
  }, [loading, reportId, honeypot]);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      // Bot-shaped submission — silently no-op (no error, no progress). The bot gets no signal.
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    const normalizedPhone = normalizePhoneToE164(phoneMobile);
    if (smsOptedIn && !normalizedPhone) {
      setError("Please add a valid mobile number with country code for SMS updates (example: +16575003620).");
      return;
    }
    const success = await captureEmail(trimmed, smsOptedIn, normalizedPhone);
    if (success) {
      setContentOptIn(null);
      setStep("insights");
    }
  };

  const handleInsightsSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (loading) return;
      setError("");
      if (!contentOptIn) {
        setError("Choose one option to continue.");
        return;
      }
      if (!turnstileToken) {
        setError("Security check is still loading — wait a second and try again.");
        return;
      }
      const normalized = email.trim().toLowerCase();
      setLoading(true);
      try {
        const res = await fetch("/api/snapshot/marketing-insights-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId,
            email: normalized,
            contentOptIn,
            turnstileToken,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not save your preference. Try again.");
          setLoading(false);
          return;
        }
        setEmailMarketingOptInPreference(contentOptIn !== "no_thanks");
        onVerified(normalized);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, contentOptIn, turnstileToken, email, reportId, onVerified],
  );

  return (
    <div className="email-verification-gate">
      <TurnstileWidget onToken={handleTurnstile} />
      <div className="email-verification-card">
        {/* Header */}
        <div className="email-verification-header">
          <div className="email-verification-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#07B0F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="email-verification-title">
            {step === "email" ? "Your results are ready!" : "One last thing"}
          </h2>
          <p className="email-verification-subtitle">
            {step === "email"
              ? `Add your email to unlock your full ${productName}. Next, you'll open the results experience — scores, insights, and PDF download — in one place.`
              : `We share occasional insights to help businesses like yours stay ahead. Choose what (if anything) you'd like by email — then we'll open your ${productName}.`}
          </p>
        </div>

        {/* Email step */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="email-verification-form">
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="Your email address"
              className="email-verification-input"
              disabled={loading}
              autoComplete="email"
            />
            {/* Honeypot — invisible to humans, bots auto-fill. */}
            <input
              type="text"
              name="company_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
            />
            {error && <p className="email-verification-error">{error}</p>}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginTop: 2,
                marginBottom: 10,
                color: "#5A6B7E",
                fontSize: 13,
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              <input
                type="checkbox"
                checked={smsOptedIn}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSmsOptedIn(checked);
                  setSmsOptInPreference(checked);
                }}
                disabled={loading}
                style={{ marginTop: 2 }}
              />
              <span>
                Yes, text me occasional updates and reminders. Message and data rates may apply. Reply STOP to opt out.
              </span>
            </label>
              {smsOptedIn && (
                <input
                  type="tel"
                  value={phoneMobile}
                  onChange={(e) => {
                    setPhoneMobile(e.target.value);
                    setError("");
                  }}
                  placeholder="Mobile number (e.g., +16575003620)"
                  className="email-verification-input"
                  disabled={loading}
                  autoComplete="tel"
                  style={{ marginBottom: 10 }}
                />
              )}
            <button
              type="submit"
              className="email-verification-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "Saving…" : "Continue"}
            </button>
            <p className="email-verification-note">
              We&apos;ll save your results to this email so you can access them later.
            </p>
          </form>
        )}

        {step === "insights" && (
          <form onSubmit={handleInsightsSubmit} className="email-verification-form">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 14,
                textAlign: "left",
              }}
            >
              {(
                [
                  { value: "marketing_trends" as const, label: "Marketing trends & brand strategy tips" },
                  { value: "ai_updates" as const, label: "AI tools & automation for business" },
                  { value: "both" as const, label: "Both — send me everything useful" },
                  { value: "no_thanks" as const, label: "No thanks — just the diagnostic" },
                ] as const
              ).map(({ value, label }) => (
                <label
                  key={value}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: contentOptIn === value ? "2px solid #07B0F2" : "1px solid #E2E8F0",
                    background: contentOptIn === value ? "#f0f9ff" : "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#334155",
                    lineHeight: 1.45,
                  }}
                >
                  <input
                    type="radio"
                    name="insights-opt-in"
                    checked={contentOptIn === value}
                    onChange={() => {
                      setContentOptIn(value);
                      setError("");
                    }}
                    disabled={loading}
                    style={{ marginTop: 3 }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {error && <p className="email-verification-error">{error}</p>}
            <button type="submit" className="email-verification-btn" disabled={loading || !contentOptIn}>
              {loading ? "Opening…" : "Continue to results"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
