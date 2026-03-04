"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const autoRetried = useRef(false);

  useEffect(() => {
    console.error("[Results Error]", error);
    import("@sentry/nextjs")
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {});
  }, [error]);

  useEffect(() => {
    if (autoRetried.current) return;
    autoRetried.current = true;
    const timer = setTimeout(() => {
      reset();
    }, 1200);
    return () => clearTimeout(timer);
  }, [reset]);

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
        Couldn&apos;t load your report
      </h2>
      <p style={{ fontSize: 15, color: "#5A6B7E", lineHeight: 1.6, margin: "0 0 24px" }}>
        We had trouble loading your WunderBrand results. We&apos;re retrying automatically.
        If it still fails, start a new snapshot.
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
          Retry
        </button>
        <Link
          href="/brand-snapshot"
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
          New Snapshot
        </Link>
      </div>
    </section>
  );
}
