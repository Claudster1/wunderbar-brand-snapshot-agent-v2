"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error Boundary]", error);
    // Report to Sentry (if configured)
    import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error);
    }).catch(() => {});
  }, [error]);

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#FEF2F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
          <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#021859",
          margin: "0 0 12px",
          letterSpacing: "-0.5px",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#5A6B7E",
          maxWidth: 440,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}
      >
        We hit an unexpected issue. This has been logged and we're looking into
        it. You can try again or head back to the homepage.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 24px",
            borderRadius: 6,
            background: "#07B0F2",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Lato', system-ui, sans-serif",
            transition: "background 0.2s",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 24px",
            borderRadius: 6,
            border: "2px solid #D6DFE8",
            background: "transparent",
            color: "#021859",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            fontFamily: "'Lato', system-ui, sans-serif",
          }}
        >
          Back to homepage
        </a>
      </div>
    </main>
  );
}
