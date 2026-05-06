"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { getPersistedEmail, persistEmail } from "@/lib/persistEmail";
import { setEmailMarketingOptInPreference } from "@/lib/smsConsent";

type Props = {
  reportId: string | null;
  turnstileToken: string | null;
  /** Active tier for AC `product_key` (snapshot, snapshot-plus, blueprint, blueprint-plus). */
  productTier?: string;
  /** Pre-known first name (e.g. from URL) for AC contact sync. */
  firstNameHint?: string | null;
  /** Optional: e.g. attach tier uploads once email is known */
  onSaved?: (email: string) => void;
};

/**
 * Early lead capture: transactional email for diagnostic delivery + resume link,
 * with explicit optional marketing opt-in (unchecked by default).
 */
export function LeadMagnetEmailCard({
  reportId,
  turnstileToken,
  productTier = "snapshot",
  firstNameHint,
  onSaved,
}: Props) {
  const [email, setEmail] = useState("");
  /** Default on: strong list growth; users may uncheck. */
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = typeof window !== "undefined" ? getPersistedEmail() : null;
    if (existing) setEmail(existing);
  }, [reportId]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !trimmed.includes("@")) {
        setError("Enter a valid email address.");
        return;
      }
      if (!reportId || reportId.startsWith("local-")) {
        setError("Session is still starting — try again in a moment.");
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
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not save. Please try again.");
          return;
        }
        persistEmail(trimmed);
        setEmailMarketingOptInPreference(marketingOptIn);
        setSaved(true);
        onSaved?.(trimmed);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [email, marketingOptIn, reportId, turnstileToken, productTier, firstNameHint, onSaved],
  );

  if (!reportId || reportId.startsWith("local-")) return null;

  if (saved) {
    return (
      <div
        className="lead-magnet-email-saved"
        style={{
          margin: "0 0 14px",
          padding: "10px 14px",
          borderRadius: 8,
          background: "#F0F9FF",
          border: "1px solid #BAE6FD",
          fontSize: 13,
          color: "#0C4A6E",
          textAlign: "center",
        }}
      >
        <strong>Got it.</strong> We&apos;ll send your diagnostic link and save link to{" "}
        <span style={{ wordBreak: "break-all" }}>{email.trim().toLowerCase()}</span> when you finish.
      </div>
    );
  }

  return (
    <div
      className="lead-magnet-email-card"
      style={{
        margin: "0 0 16px",
        padding: "14px 16px",
        borderRadius: 10,
        border: "1px solid #D6DFE8",
        background: "#FAFBFC",
        textAlign: "left",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#021859" }}>
        Get your free diagnostic by email
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#5A6B7E", lineHeight: 1.45 }}>
        Add your email so we can send your results, a save link if you step away, and upgrade options that
        fit your tier. Same free diagnostic — we just don&apos;t lose you if life interrupts.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="lead-magnet-email" className="sr-only">
          Email for diagnostic delivery
        </label>
        <input
          id="lead-magnet-email"
          type="email"
          name="lead-magnet-email"
          autoComplete="email"
          value={email}
          onChange={(ev) => {
            setEmail(ev.target.value);
            setError(null);
          }}
          placeholder="you@company.com"
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #D6DFE8",
            fontSize: 14,
          }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 12,
            fontSize: 12,
            color: "#5A6B7E",
            lineHeight: 1.45,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(ev) => setMarketingOptIn(ev.target.checked)}
            disabled={saving}
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <span>
            Yes — include me on occasional brand &amp; marketing tips by email. Uncheck if you only want
            diagnostic-related messages. Unsubscribe anytime.
          </span>
        </label>
        {error ? (
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#B91C1C" }} role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving || !email.trim()}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 6,
            border: "none",
            background: saving ? "#94A3B8" : "#07B0F2",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save my email for results"}
        </button>
        <p style={{ margin: "10px 0 0", fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>
          By continuing, you agree we may email you about this diagnostic. Marketing tips are on by default;
          uncheck the box above if you only want diagnostic-related email.{" "}
          <a
            href="https://wunderbardigital.com/privacy-policy?utm_source=diagnostic_flow&utm_medium=lead_capture&utm_campaign=privacy&utm_content=privacy_policy"
            target="_blank"
            rel="noopener noreferrer"
            className="assessment-privacy-link"
            style={{ color: "#07B0F2" }}
          >
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}
