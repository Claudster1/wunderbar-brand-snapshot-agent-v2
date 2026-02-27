"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SnapshotError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Brand Snapshot Error]", error);
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
          background: "#FEF3C7",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#021859", margin: "0 0 8px" }}>
        Something interrupted your snapshot
      </h2>
      <p style={{ fontSize: 15, color: "#5A6B7E", lineHeight: 1.6, margin: "0 0 24px" }}>
        Don&apos;t worry — your progress may have been saved. Try picking up where you left off.
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
          Resume
        </button>
        <Link
          href="/"
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
          Home
        </Link>
      </div>
    </section>
  );
}
