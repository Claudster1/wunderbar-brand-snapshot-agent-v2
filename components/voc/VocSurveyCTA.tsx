// components/voc/VocSurveyCTA.tsx
// "Strengthen Your Report" CTA — shown on paid report pages
// Allows users to create a VOC survey and share with customers
"use client";

import { useState, useEffect } from "react";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6E4F0";
const WHITE = "#FFFFFF";
const GREEN = "#22C55E";

export function VocSurveyCTA({
  reportId,
  businessName,
}: {
  reportId: string;
  businessName: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [surveyUrl, setSurveyUrl] = useState("");
  const [responseCount, setResponseCount] = useState(0);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if survey already exists
  useEffect(() => {
    fetch(`/api/voc/status?reportId=${reportId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hasSurvey) {
          setSurveyUrl(data.surveyUrl);
          setResponseCount(data.responseCount ?? 0);
          setAnalysisReady(data.analysisReady ?? false);
          setStatus("ready");
        }
      })
      .catch(() => {});
  }, [reportId]);

  const handleCreate = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/voc/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, businessName }),
      });
      const data = await res.json();
      if (data.surveyUrl) {
        setSurveyUrl(data.surveyUrl);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    const token = surveyUrl.split("/survey/")[1];
    if (!token) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/voc/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyToken: token }),
      });
      if (res.ok) {
        setAnalysisReady(true);
        setStatus("ready");
        // Reload the page to show the analysis section
        window.location.reload();
      } else {
        setStatus("ready");
      }
    } catch {
      setStatus("ready");
    }
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${NAVY} 0%, #0A2E6E 100%)`,
      borderRadius: 12,
      padding: "28px 28px 24px",
      marginBottom: 32,
      color: WHITE,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: "rgba(7, 176, 242, 0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: WHITE, margin: "0 0 6px" }}>
            Strengthen Your Report with Customer Insights
          </h3>
          <p style={{ fontSize: 14, color: "#C9D6FF", lineHeight: 1.6, margin: "0 0 16px" }}>
            See how your customers actually perceive your brand. Send a 2-minute survey to 5–10 customers and we&apos;ll add their perspective to your diagnostic — including perception gaps, WunderBrand Experience Score™, and blind spots.
          </p>

          {status === "idle" && (
            <button
              type="button"
              onClick={handleCreate}
              style={{
                padding: "12px 24px", borderRadius: 8,
                border: "none", background: BLUE, color: WHITE,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Create Customer Survey →
            </button>
          )}

          {status === "loading" && (
            <div style={{ fontSize: 14, color: "#C9D6FF" }}>Setting up your survey...</div>
          )}

          {status === "ready" && (
            <div>
              <div style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 12,
              }}>
                <input
                  type="text"
                  value={surveyUrl}
                  readOnly
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    color: WHITE, fontSize: 14, outline: "none",
                    fontFamily: "'Lato', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    padding: "6px 14px", borderRadius: 6,
                    border: `1px solid ${copied ? GREEN : "rgba(255,255,255,0.3)"}`,
                    background: copied ? `${GREEN}20` : "transparent",
                    color: copied ? GREEN : WHITE,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Lato', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13 }}>
                <span style={{ color: "#C9D6FF" }}>
                  {responseCount} response{responseCount !== 1 ? "s" : ""} collected
                </span>
                {responseCount >= 3 && !analysisReady && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    style={{
                      padding: "6px 16px", borderRadius: 6,
                      border: "none", background: GREEN, color: WHITE,
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Lato', sans-serif",
                    }}
                  >
                    Generate Analysis →
                  </button>
                )}
                {analysisReady && (
                  <span style={{ color: GREEN, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Analysis ready — see below
                  </span>
                )}
                {responseCount < 3 && (
                  <span style={{ color: "#94A3B8" }}>
                    Need {3 - responseCount} more for analysis
                  </span>
                )}
              </div>

              <p style={{ fontSize: 12, color: "#94A3B8", margin: "12px 0 0", lineHeight: 1.5 }}>
                Share this link with your customers via email, Slack, or text. Their responses are anonymous.
              </p>
            </div>
          )}

          {status === "error" && (
            <p style={{ fontSize: 14, color: "#FCA5A5" }}>Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
