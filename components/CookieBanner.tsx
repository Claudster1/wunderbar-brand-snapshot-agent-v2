"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getConsent,
  acceptAll,
  declineAll,
  setConsent,
  type ConsentState,
} from "@/lib/cookieConsent";

/* ─── Brand tokens ─── */
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const LIGHT_BG = "#F4F7FB";

/**
 * CookieBanner
 *
 * Shows on first visit. Remembers choice in a first-party cookie.
 * When analytics consent is granted, injects the AC site tracking script.
 * Also exposes a global `window.__openCookieSettings()` for the footer link.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [consent, setConsentState] = useState<ConsentState | null>(null);

  // Check on mount
  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      setConsentState(existing);
      if (existing.analytics) injectTracking();
    } else {
      // Small delay so the page renders before the banner slides in
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Expose global function for "Cookie Settings" footer link
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__openCookieSettings = () => {
      const existing = getConsent();
      if (existing) {
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
      }
      setShowPrefs(true);
      setVisible(true);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__openCookieSettings;
    };
  }, []);

  const handleAcceptAll = useCallback(() => {
    const state = acceptAll();
    setConsentState(state);
    setVisible(false);
    setShowPrefs(false);
    injectTracking();
  }, []);

  const handleDecline = useCallback(() => {
    const state = declineAll();
    setConsentState(state);
    setVisible(false);
    setShowPrefs(false);
  }, []);

  const handleSavePrefs = useCallback(() => {
    const state = setConsent({ analytics, marketing });
    setConsentState(state);
    setVisible(false);
    setShowPrefs(false);
    if (analytics) injectTracking();
  }, [analytics, marketing]);

  // Don't render if consent already given and banner not manually opened
  if (!visible && consent) return null;
  if (!visible) return null;

  return (
    <>
      {/* Backdrop for preferences panel */}
      {showPrefs && (
        <div
          onClick={() => setShowPrefs(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(2,24,89,0.3)",
            zIndex: 99998, backdropFilter: "blur(2px)",
          }}
        />
      )}

      <div
        role="dialog"
        aria-label="Cookie consent"
        style={{
          position: "fixed",
          bottom: showPrefs ? "50%" : 0,
          left: showPrefs ? "50%" : 0,
          right: showPrefs ? "auto" : 0,
          transform: showPrefs ? "translate(-50%, 50%)" : "none",
          width: showPrefs ? "min(460px, calc(100vw - 32px))" : "100%",
          background: WHITE,
          borderTop: showPrefs ? "none" : `1px solid ${BORDER}`,
          borderRadius: showPrefs ? 12 : 0,
          boxShadow: "0 -4px 24px rgba(2,24,89,0.12)",
          zIndex: 99999,
          fontFamily: "'Lato', system-ui, sans-serif",
          animation: "cookieSlideUp 0.4s ease",
        }}
      >
        <div style={{ padding: showPrefs ? "24px" : "16px 24px", maxWidth: showPrefs ? "none" : 960, margin: "0 auto" }}>
          {!showPrefs ? (
            /* ─── Compact Banner ─── */
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ margin: 0, fontSize: 13, color: NAVY, lineHeight: 1.5 }}>
                  We use cookies to improve your experience and understand how you interact with our tools.{" "}
                  <button
                    onClick={() => setShowPrefs(true)}
                    style={{
                      background: "none", border: "none", color: BLUE,
                      textDecoration: "underline", cursor: "pointer", fontSize: 13,
                      fontFamily: "inherit", padding: 0,
                    }}
                  >
                    Manage preferences
                  </button>
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={handleDecline} style={btnStyle(true)}>
                  Decline
                </button>
                <button onClick={handleAcceptAll} style={btnStyle(false)}>
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            /* ─── Preferences Panel ─── */
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: NAVY }}>
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => { setShowPrefs(false); if (!consent) setVisible(true); else setVisible(false); }}
                  aria-label="Close"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 18, color: SUB, lineHeight: 1, padding: "4px",
                  }}
                >
                  ×
                </button>
              </div>

              <p style={{ fontSize: 13, color: SUB, lineHeight: 1.6, margin: "0 0 20px" }}>
                Choose which cookies you allow. Essential cookies are always active — they keep the app working.
                You can change these settings anytime.
              </p>

              {/* Essential */}
              <CookieCategory
                label="Essential"
                description="Required for the app to function. Authentication, security, and core features."
                checked={true}
                disabled={true}
              />

              {/* Analytics */}
              <CookieCategory
                label="Analytics"
                description="Help us understand how you use WunderBrand so we can improve the experience. Includes ActiveCampaign site tracking."
                checked={analytics}
                onChange={setAnalytics}
              />

              {/* Marketing */}
              <CookieCategory
                label="Marketing"
                description="Used for personalized content and ad targeting. We don't currently use marketing cookies, but this is here for the future."
                checked={marketing}
                onChange={setMarketing}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
                <button onClick={handleDecline} style={btnStyle(true)}>
                  Decline All
                </button>
                <button onClick={handleSavePrefs} style={btnStyle(false)}>
                  Save Preferences
                </button>
              </div>

              <p style={{ fontSize: 11, color: SUB, marginTop: 14, textAlign: "center" }}>
                <a
                  href="https://wunderbardigital.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: BLUE, textDecoration: "none" }}
                >
                  Privacy Policy
                </a>
                {" · "}
                <a
                  href="https://wunderbardigital.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: BLUE, textDecoration: "none" }}
                >
                  Terms of Service
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: ${showPrefs ? "translate(-50%, 55%)" : "translateY(100%)"}; }
          to   { opacity: 1; transform: ${showPrefs ? "translate(-50%, 50%)" : "translateY(0)"}; }
        }
      `}</style>
    </>
  );
}

/* ─── Cookie Category Toggle ─── */
function CookieCategory({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "12px 14px", background: LIGHT_BG, borderRadius: 8,
      border: `1px solid ${BORDER}`, marginBottom: 10,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 2 }}>
          {label}
          {disabled && (
            <span style={{ fontSize: 10, color: SUB, fontWeight: 500, marginLeft: 6 }}>
              Always active
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: SUB, lineHeight: 1.5 }}>{description}</div>
      </div>
      <label style={{
        position: "relative", width: 40, height: 22, flexShrink: 0, marginTop: 2,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
        />
        <span style={{
          position: "absolute", inset: 0, borderRadius: 11,
          background: checked ? BLUE : "#CBD5E1",
          transition: "background 0.2s ease",
        }} />
        <span style={{
          position: "absolute", top: 2, left: checked ? 20 : 2,
          width: 18, height: 18, borderRadius: "50%",
          background: WHITE, boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transition: "left 0.2s ease",
        }} />
      </label>
    </div>
  );
}

/* ─── Button styles ─── */
function btnStyle(outline: boolean): React.CSSProperties {
  return {
    padding: "9px 18px", fontSize: 13, fontWeight: 700,
    background: outline ? "transparent" : BLUE,
    color: outline ? NAVY : WHITE,
    border: outline ? `1.5px solid ${BORDER}` : `1.5px solid ${BLUE}`,
    borderRadius: 8, cursor: "pointer",
    fontFamily: "'Lato', system-ui, sans-serif",
    transition: "opacity 0.15s ease",
  };
}

/* ─── Inject tracking scripts when analytics consent is given ─── */
function injectTracking() {
  if (typeof window === "undefined") return;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w = window as any;

  // AC Site Tracking (diffuser.js)
  if (!w.vgo) {
    const script = document.createElement("script");
    script.src = "https://diffuser-cdn.app-us1.com/diffuser/diffuser.js";
    script.async = true;
    document.head.appendChild(script);

    w.visitorGlobalObjectAlias = "vgo";
    const vgoQueue: unknown[][] = [];
    w.vgo = function (...args: unknown[]) { vgoQueue.push(args); };
    w.vgo.q = vgoQueue;
    w.vgo.l = Date.now();

    script.onload = () => {
      if (typeof w.vgo === "function") {
        w.vgo("setTrackByDefault", true);
        w.vgo("process");
      }
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
