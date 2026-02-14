// components/dashboard/DashboardHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";

function scoreColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#4ADE80";
  if (score >= 40) return "#EAB308";
  if (score >= 20) return "#F97316";
  return "#EF4444";
}

export default function DashboardHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const email = getPersistedEmail();

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(`/api/history?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[DashboardHistory] Error:", err);
        setError("We couldn't load your reports. Please try again.");
        setLoading(false);
      });
  }, [email]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `3px solid ${BORDER}`, borderTopColor: BLUE,
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ fontSize: 15, color: SUB, fontFamily: "'Lato', sans-serif" }}>Loading your reports...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: "center", padding: "48px 24px",
        fontFamily: "'Lato', sans-serif",
      }}>
        <p style={{ fontSize: 15, color: "#991B1B", marginBottom: 16 }}>{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            if (email) {
              fetch(`/api/history?email=${encodeURIComponent(email)}`)
                .then((res) => res.json())
                .then((data) => {
                  setHistory(data || []);
                  setLoading(false);
                })
                .catch(() => {
                  setError("Still having trouble. Please try again later.");
                  setLoading(false);
                });
            }
          }}
          style={{
            padding: "8px 20px", borderRadius: 6,
            background: BLUE, color: WHITE, border: "none",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  /* No email found — user hasn't completed an assessment yet */
  if (!email) {
    return (
      <div style={{
        textAlign: "center", padding: "48px 24px",
        fontFamily: "'Lato', sans-serif",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${BLUE}10`, display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
            <path d="M9 12h6M12 9v6" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="10" stroke={BLUE} strokeWidth="2" />
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
          No reports yet
        </h2>
        <p style={{ fontSize: 15, color: SUB, margin: "0 0 24px", lineHeight: 1.6 }}>
          Complete a WunderBrand Snapshot™ assessment to see your reports here.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: 48, padding: "0 24px", borderRadius: 6,
            background: BLUE, color: WHITE, fontWeight: 700, fontSize: 14,
            textDecoration: "none",
          }}
        >
          Start a WunderBrand Snapshot™
        </a>
      </div>
    );
  }

  /* Empty history */
  if (history.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "48px 24px",
        fontFamily: "'Lato', sans-serif",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${BLUE}10`, display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
            <rect x="3" y="4" width="18" height="16" rx="2" stroke={BLUE} strokeWidth="2" />
            <path d="M9 9h6M9 13h4" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
          No completed reports
        </h2>
        <p style={{ fontSize: 15, color: SUB, margin: "0 0 24px", lineHeight: 1.6 }}>
          You haven't completed a WunderBrand Snapshot™ assessment yet. It takes about 10–15 minutes.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: 48, padding: "0 24px", borderRadius: 6,
            background: BLUE, color: WHITE, fontWeight: 700, fontSize: 14,
            textDecoration: "none",
          }}
        >
          Start a WunderBrand Snapshot™
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {history.map((snap) => {
        const score = snap.brand_alignment_score || 0;
        const color = scoreColor(score);
        return (
          <div
            key={snap.id}
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              padding: "20px 24px",
              background: WHITE,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              fontFamily: "'Lato', sans-serif",
              transition: "box-shadow 0.2s ease",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6 }}>
                {snap.brand_name || "WunderBrand Snapshot™"}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: SUB }}>
                <span>
                  WunderBrand Score™:{" "}
                  <strong style={{ color }}>{score}</strong>
                </span>
                {snap.primary_pillar && (
                  <span>
                    Primary focus: <strong style={{ color: NAVY }}>{snap.primary_pillar}</strong>
                  </span>
                )}
                {snap.created_at && (
                  <span>
                    {new Date(snap.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            <a
              href={`/report/${snap.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 6,
                border: `1.5px solid ${BLUE}`,
                background: `${BLUE}08`,
                color: BLUE,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
            >
              View Report →
            </a>
          </div>
        );
      })}
    </div>
  );
}
