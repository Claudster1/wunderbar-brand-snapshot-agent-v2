"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { persistEmail } from "@/lib/persistEmail";
import { setEmailMarketingOptInPreference } from "@/lib/smsConsent";
import {
  getStrongestAndWeakestPillars,
  labelPillar,
  overallScoreBand,
  pillarStrengthBand,
  type ScoreTeaserPayload,
} from "@/lib/diagnostic/scoreTeaserCopy";
import { getPersistedEmail } from "@/lib/persistEmail";

export type { ScoreTeaserPayload };

export type ScoreTeaserUnlockDetail = {
  email: string;
  reportId: string;
  redirectUrl: string;
};

type Props = {
  teaser: ScoreTeaserPayload;
  turnstileToken: string | null;
  productTier: string;
  firstNameHint?: string | null;
  productName: string;
  onUnlocked: (detail: ScoreTeaserUnlockDetail) => void;
};

/**
 * Zillow-style: show score taste, then email (+ marketing opt-in) to unlock full results navigation.
 */
export function ResultsScoreTeaserGate({
  teaser,
  turnstileToken,
  productTier,
  firstNameHint,
  productName,
  onUnlocked,
}: Props) {
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { strongest, weakest } = getStrongestAndWeakestPillars(teaser.pillarScores);
  const band = overallScoreBand(teaser.brandAlignmentScore);
  const strongLabel = labelPillar(strongest.key);
  const weakLabel = labelPillar(weakest.key);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = getPersistedEmail();
    if (existing) setEmail(existing);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !trimmed.includes("@")) {
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
            reportId: teaser.reportId,
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
        onUnlocked({
          email: trimmed,
          reportId: teaser.reportId,
          redirectUrl: teaser.redirectUrl,
        });
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [email, marketingOptIn, firstNameHint, onUnlocked, productTier, teaser.reportId, turnstileToken],
  );

  return (
    <div
      role="region"
      aria-label="Your score preview"
      style={{
        margin: "0 0 14px",
        padding: "18px 16px",
        borderRadius: 12,
        border: "2px solid #07B0F2",
        background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 55%)",
        boxShadow: "0 8px 28px rgba(7, 176, 242, 0.12)",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "#0369A1" }}>
        YOUR WUNDERBRAND SCORE™ PREVIEW
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "10px 16px", marginBottom: 12 }}>
        <span style={{ fontSize: 42, fontWeight: 800, color: "#021859", lineHeight: 1 }}>
          {teaser.brandAlignmentScore}
          <span style={{ fontSize: 18, fontWeight: 700, color: "#64748B" }}>/100</span>
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0C4A6E",
            padding: "4px 10px",
            borderRadius: 999,
            background: "#BAE6FD",
          }}
        >
          {band} overall
        </span>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#334155", lineHeight: 1.55 }}>
        You&apos;re comparatively <strong>{pillarStrengthBand(strongest.score)}</strong> on{" "}
        <strong>{strongLabel}</strong> and <strong>{pillarStrengthBand(weakest.score)}</strong> on{" "}
        <strong>{weakLabel}</strong> — full pillar breakdown, priority actions, and upgrade paths unlock below.
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#021859" }}>
        Where should we email your full {productName}?
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="teaser-unlock-email" className="sr-only">
          Email for full diagnostic
        </label>
        <input
          id="teaser-unlock-email"
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
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            marginBottom: 10,
            borderRadius: 8,
            border: "1px solid #CBD5E1",
            fontSize: 15,
          }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 12,
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.45,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(ev) => setMarketingOptIn(ev.target.checked)}
            disabled={saving}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: "#021859", flexShrink: 0 }}
          />
          <span>
            Yes — include me on occasional brand &amp; marketing tips by email (recommended). Uncheck for diagnostic-only
            email. Unsubscribe anytime.
          </span>
        </label>
        {error ? (
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#B91C1C" }} role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving || !email.trim()}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 8,
            border: "none",
            background: saving ? "#94A3B8" : "#07B0F2",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Unlocking…" : "Unlock my full diagnostic"}
        </button>
        <p style={{ margin: "12px 0 0", fontSize: 11, color: "#64748B", lineHeight: 1.45 }}>
          We use your email to deliver this {productName} and save links.{" "}
          <a
            href="https://wunderbardigital.com/privacy-policy?utm_source=diagnostic_flow&utm_medium=score_teaser&utm_campaign=privacy&utm_content=privacy_policy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0284C7", fontWeight: 600 }}
          >
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}
