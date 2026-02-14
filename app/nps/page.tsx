"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const SUB = "#5A6B7E";
const BORDER = "#D6E4F0";
const LIGHT_BG = "#F7FAFD";

const SCORE_COLORS: Record<string, string> = {
  detractor: "#ef4444",
  passive: "#f59e0b",
  promoter: "#10b981",
};

function getCategory(score: number): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case "promoter":
      return "We're glad to hear it!";
    case "passive":
      return "Thanks for the honest feedback.";
    case "detractor":
      return "We appreciate your honesty.";
    default:
      return "";
  }
}

function getFollowUpQuestion(cat: string): string {
  switch (cat) {
    case "promoter":
      return "What do you value most about your WunderBrand Suite™ experience?";
    case "passive":
      return "What could we do to make your experience even better?";
    case "detractor":
      return "What was the biggest disappointment or gap in your experience?";
    default:
      return "What's the main reason for your score?";
  }
}

function NPSContent() {
  const searchParams = useSearchParams();

  const initialScore = searchParams.get("score");
  const reportId = searchParams.get("reportId") || searchParams.get("report_id") || "";
  const email = searchParams.get("email") || "";
  const tier = searchParams.get("tier") || "snapshot";

  const [selectedScore, setSelectedScore] = useState<number | null>(
    initialScore !== null ? Math.min(10, Math.max(0, parseInt(initialScore, 10))) : null
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Reset NaN
  useEffect(() => {
    if (selectedScore !== null && isNaN(selectedScore)) {
      setSelectedScore(null);
    }
  }, [selectedScore]);

  const category = selectedScore !== null ? getCategory(selectedScore) : null;

  async function handleSubmit() {
    if (selectedScore === null) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/nps/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: selectedScore,
          reason: reason.trim() || null,
          reportId,
          email,
          tier,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (e) {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // ─── Thank You State ───
  if (submitted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: LIGHT_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          fontFamily: "'Lato', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
            background: WHITE,
            borderRadius: 12,
            padding: "48px 36px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: `1px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `${BLUE}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 28,
            }}
          >
            {category === "promoter" ? "🎉" : category === "passive" ? "👍" : "🙏"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
            Thank you for your feedback
          </h1>
          <p style={{ fontSize: 15, color: SUB, lineHeight: 1.6, margin: "0 0 24px" }}>
            Your response helps us make WunderBrand Suite™ better for everyone.
            {category === "detractor" &&
              " We take every response seriously and will use your feedback to improve."}
          </p>
          <a
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              padding: "0 28px",
              borderRadius: 8,
              background: BLUE,
              color: WHITE,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Go to my dashboard
          </a>
        </div>
      </main>
    );
  }

  // ─── Survey Form ───
  return (
    <main
      style={{
        minHeight: "100vh",
        background: LIGHT_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: WHITE,
          borderRadius: 12,
          padding: "40px 36px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: `1px solid ${BORDER}`,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: BLUE,
              margin: "0 0 8px",
            }}
          >
            Quick Feedback
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
            How likely are you to recommend WunderBrand Suite™?
          </h1>
          <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
            One question. Takes 10 seconds. Helps us improve.
          </p>
        </div>

        {/* Score Buttons */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(11, 1fr)",
              gap: 4,
            }}
          >
            {Array.from({ length: 11 }, (_, i) => {
              const isSelected = selectedScore === i;
              const cat = getCategory(i);
              const activeColor = SCORE_COLORS[cat];

              return (
                <button
                  key={i}
                  onClick={() => setSelectedScore(i)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 8,
                    border: isSelected ? `2px solid ${activeColor}` : `1.5px solid ${BORDER}`,
                    background: isSelected ? activeColor : WHITE,
                    color: isSelected ? WHITE : NAVY,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i}
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 11,
              color: SUB,
              fontWeight: 400,
            }}
          >
            <span>Not likely</span>
            <span>Extremely likely</span>
          </div>
        </div>

        {/* Follow-up question (appears after score selection) */}
        {selectedScore !== null && category && (
          <div
            style={{
              marginTop: 28,
              padding: "20px 24px",
              background: LIGHT_BG,
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: NAVY,
                margin: "0 0 4px",
              }}
            >
              {getCategoryLabel(category)}
            </p>
            <p style={{ fontSize: 13, color: SUB, margin: "0 0 12px" }}>
              {getFollowUpQuestion(category)}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional — but we read every response..."
              maxLength={2000}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1.5px solid ${BORDER}`,
                fontSize: 14,
                fontFamily: "'Lato', system-ui, sans-serif",
                color: NAVY,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, textAlign: "center" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selectedScore === null || submitting}
          style={{
            width: "100%",
            height: 48,
            marginTop: 24,
            borderRadius: 8,
            border: "none",
            background: selectedScore !== null ? BLUE : `${BLUE}40`,
            color: WHITE,
            fontSize: 15,
            fontWeight: 700,
            cursor: selectedScore !== null && !submitting ? "pointer" : "default",
            transition: "background 0.2s",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>

        <p
          style={{
            fontSize: 12,
            color: SUB,
            textAlign: "center",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Your feedback is confidential and used only to improve our products.
        </p>
      </div>
    </main>
  );
}

export default function NPSPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Lato', system-ui, sans-serif",
            color: SUB,
          }}
        >
          Loading...
        </main>
      }
    >
      <NPSContent />
    </Suspense>
  );
}
