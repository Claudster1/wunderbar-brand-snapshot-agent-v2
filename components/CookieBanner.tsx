"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getConsent,
  setConsent as saveConsent,
  type ConsentState,
} from "@/lib/cookieConsent";

/* ─── Brand Tokens ─── */
const BRAND = {
  blue: "#07B0F2",
  blueHover: "#0599D4",
  navy: "#0A2540",
  muted: "#5A6B7E",
  lightBg: "#F7F9FC",
  border: "#E2E8F0",
  white: "#FFFFFF",
  accent: "#E8F7FE",
  shadow: "0 -4px 32px rgba(10, 37, 64, 0.10)",
  modalShadow: "0 24px 64px rgba(10, 37, 64, 0.18)",
};

const CATEGORIES = [
  {
    id: "essential" as const,
    label: "Essential Cookies",
    description:
      "Required for the site to function properly — session management, authentication, and core app features.",
    locked: true,
    defaultOn: true,
  },
  {
    id: "analytics" as const,
    label: "Analytics Cookies",
    description:
      "Help us understand how visitors use our site so we can improve the experience.",
    locked: false,
    defaultOn: true,
  },
  {
    id: "marketing" as const,
    label: "Marketing Cookies",
    description:
      "Used to deliver relevant content and measure campaigns. Currently inactive — future-proofed for when we need them.",
    locked: false,
    defaultOn: false,
  },
];

/* ─── Toggle Switch ─── */
function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#CBD5E1" : on ? BRAND.blue : "#CBD5E1",
        transition: "background 0.25s ease",
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        outline: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: BRAND.white,
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </button>
  );
}

/* ─── Preference Row ─── */
function PreferenceRow({
  category,
  checked,
  onChange,
}: {
  category: (typeof CATEGORIES)[number];
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 0",
        borderBottom: `1px solid ${BRAND.border}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: BRAND.navy,
              lineHeight: 1.3,
            }}
          >
            {category.label}
          </span>
          {category.locked && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: BRAND.muted,
                background: "#EDF2F7",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              Always on
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 13,
            color: BRAND.muted,
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {category.description}
        </p>
      </div>
      <div style={{ paddingTop: 2 }}>
        <Toggle on={checked} onChange={onChange} disabled={category.locked} />
      </div>
    </div>
  );
}

/* ─── Preferences Modal ─── */
function PreferencesModal({
  preferences,
  setPreferences,
  onSave,
  onAcceptAll,
  onClose,
}: {
  preferences: Record<string, boolean>;
  setPreferences: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSave: () => void;
  onAcceptAll: () => void;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 37, 64, 0.45)",
        backdropFilter: "blur(4px)",
        animation: "cookieFadeIn 0.25s ease",
        padding: 20,
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: BRAND.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: BRAND.modalShadow,
          animation: "cookieSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "24px 28px 0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: BRAND.navy,
                lineHeight: 1.3,
              }}
            >
              Cookie Preferences
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: BRAND.muted,
                lineHeight: 1.5,
              }}
            >
              Choose which cookies you&apos;re comfortable with. You can change
              these anytime.{" "}
              <a
                href="https://wunderbardigital.com/privacy-policy#pp-cookies"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: BRAND.blue,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Cookie details
              </a>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: BRAND.muted,
              fontSize: 22,
              lineHeight: 1,
              padding: "4px 0 0",
              marginLeft: 12,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Toggles */}
        <div style={{ padding: "8px 28px 4px" }}>
          {CATEGORIES.map((cat) => (
            <PreferenceRow
              key={cat.id}
              category={cat}
              checked={preferences[cat.id]}
              onChange={(val) =>
                setPreferences((prev) => ({ ...prev, [cat.id]: val }))
              }
            />
          ))}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "20px 28px 24px",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button onClick={onAcceptAll} style={styles.secondaryBtn}>
            Accept All
          </button>
          <button onClick={onSave} style={styles.primaryBtn}>
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─── Confirmation Toast ─── */
function ConfirmToast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10002,
        background: BRAND.navy,
        color: BRAND.white,
        padding: "12px 24px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 8px 24px rgba(10, 37, 64, 0.25)",
        animation: "cookieToastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "'Lato', sans-serif",
      }}
    >
      <span style={{ fontSize: 16 }}>✓</span> {message}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/* ─── Main CookieBanner Component ─── */
/* ═══════════════════════════════════════════ */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultOn])),
  );

  // Check existing consent on mount
  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      setConsentState(existing);
      setPreferences({
        essential: true,
        analytics: existing.analytics,
        marketing: existing.marketing,
      });
      if (existing.analytics) injectTracking();
    } else {
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
        setPreferences({
          essential: true,
          analytics: existing.analytics,
          marketing: existing.marketing,
        });
      }
      setModalOpen(true);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__openCookieSettings;
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleAcceptAll = useCallback(() => {
    const state = saveConsent({ analytics: true, marketing: true });
    setConsentState(state);
    setPreferences({ essential: true, analytics: true, marketing: true });
    setVisible(false);
    setModalOpen(false);
    injectTracking();
    showToast("All cookies accepted — preferences saved for 1 year");
  }, [showToast]);

  const handleDeclineAll = useCallback(() => {
    const state = saveConsent({ analytics: false, marketing: false });
    setConsentState(state);
    setPreferences({ essential: true, analytics: false, marketing: false });
    setVisible(false);
    setModalOpen(false);
    showToast("Non-essential cookies declined — only essentials active");
  }, [showToast]);

  const handleSavePreferences = useCallback(() => {
    const state = saveConsent({
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
    setConsentState(state);
    setVisible(false);
    setModalOpen(false);
    if (preferences.analytics) injectTracking();
    const active = Object.entries(preferences)
      .filter(([, v]) => v)
      .map(([k]) => k);
    showToast(`Preferences saved — ${active.join(", ")} cookies active`);
  }, [preferences, showToast]);

  // Don't render anything if consent exists, modal not open, and no toast
  if (!visible && !modalOpen && !toast && consent) return null;
  if (!visible && !modalOpen && !toast) return null;

  return (
    <>
      <style>{`
        @keyframes cookieFadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(16px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes cookieBannerSlide {
          from { opacity: 0; transform: translateY(100%) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes cookieToastIn {
          from { opacity: 0; transform: translate(-50%, 12px) }
          to { opacity: 1; transform: translate(-50%, 0) }
        }
      `}</style>

      {/* ─── Bottom Banner ─── */}
      {visible && !modalOpen && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            fontFamily: "'Lato', sans-serif",
            animation: "cookieBannerSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              background: BRAND.white,
              boxShadow: BRAND.shadow,
              borderTop: `1px solid ${BRAND.border}`,
            }}
          >
            <div
              style={{
                maxWidth: 1120,
                margin: "0 auto",
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              {/* Left: Icon + Copy */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  flex: 1,
                  minWidth: 260,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: BRAND.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                  }}
                >
                  🍪
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: BRAND.navy,
                      lineHeight: 1.4,
                    }}
                  >
                    We value your privacy
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: BRAND.muted,
                      lineHeight: 1.5,
                    }}
                  >
                    We use cookies to improve your experience and understand how
                    our site is used.{" "}
                    <a
                      href="https://wunderbardigital.com/privacy-policy#pp-cookies"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: BRAND.blue,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        fontFamily: "inherit",
                      }}
                    >
                      Learn more
                    </a>
                    {" · "}
                    <button
                      onClick={() => setModalOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: BRAND.blue,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                        fontFamily: "inherit",
                      }}
                    >
                      Manage Preferences
                    </button>
                  </p>
                </div>
              </div>

              {/* Right: Buttons */}
              <div
                style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}
              >
                <button onClick={handleDeclineAll} style={styles.outlineBtn}>
                  Decline All
                </button>
                <button onClick={handleAcceptAll} style={styles.primaryBtn}>
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Preferences Modal ─── */}
      {modalOpen && (
        <PreferencesModal
          preferences={preferences}
          setPreferences={setPreferences}
          onSave={handleSavePreferences}
          onAcceptAll={handleAcceptAll}
          onClose={() => {
            setModalOpen(false);
            if (!consent) setVisible(true);
          }}
        />
      )}

      {/* ─── Toast ─── */}
      {toast && <ConfirmToast message={toast} />}
    </>
  );
}

/* ─── Shared Button Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  primaryBtn: {
    background: BRAND.blue,
    color: BRAND.white,
    border: "none",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    transition: "background 0.2s ease",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    background: "transparent",
    color: BRAND.blue,
    border: `1.5px solid ${BRAND.blue}`,
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  outlineBtn: {
    background: "transparent",
    color: BRAND.muted,
    border: `1.5px solid ${BRAND.border}`,
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
};

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
    w.vgo = function (...args: unknown[]) {
      vgoQueue.push(args);
    };
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
