"use client";

import { useEffect } from "react";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Checkout Error]", error);
    import("@sentry/nextjs")
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {});
  }, [error]);

  return (
    <section
      style={{
        maxWidth: 600,
        margin: "80px auto",
        textAlign: "center",
        padding: "0 24px",
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#FEE2E2",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
          <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#021859", margin: "0 0 8px" }}>
        Checkout couldn&apos;t be completed
      </h2>
      <p style={{ fontSize: 15, color: "#5A6B7E", lineHeight: 1.6, margin: "0 0 8px" }}>
        There was a problem processing your upgrade. No charge has been made.
      </p>
      <p style={{ fontSize: 13, color: "#5A6B7E", lineHeight: 1.6, margin: "0 0 24px" }}>
        If this keeps happening, please contact{" "}
        <a href="mailto:support@wunderbardigital.com" style={{ color: "#07B0F2" }}>
          support@wunderbardigital.com
        </a>
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px",
            borderRadius: 6,
            background: "#07B0F2",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/dashboard"
          style={{
            padding: "10px 24px",
            borderRadius: 6,
            border: "2px solid #D6DFE8",
            color: "#021859",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Back to dashboard
        </a>
      </div>
    </section>
  );
}
