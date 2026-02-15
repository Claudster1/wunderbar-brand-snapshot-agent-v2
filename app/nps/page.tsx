"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const SUB = "#5A6B7E";
const BORDER = "#D6E4F0";
const LIGHT_BG = "#F7FAFD";
const GREEN = "#10b981";

const SCORE_COLORS: Record<string, string> = {
  detractor: "#ef4444",
  passive: "#f59e0b",
  promoter: GREEN,
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
      return "What do you value most about your WunderBrand Suite\u2122 experience?";
    case "passive":
      return "What could we do to make your experience even better?";
    case "detractor":
      return "What was the biggest disappointment or gap in your experience?";
    default:
      return "What\u2019s the main reason for your score?";
  }
}

// ─── Google Review URL ───
// Replace with your actual Google Business review link
const GOOGLE_REVIEW_URL = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "";

// ═══════════════════════════════════════════
// Testimonial Capture Form (shown to promoters after NPS submission)
// ═══════════════════════════════════════════
function TestimonialCapture({
  reportId,
  email,
  tier,
  npsScore,
}: {
  reportId: string;
  email: string;
  tier: string;
  npsScore: number;
}) {
  const [testimonial, setTestimonial] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [permissionToPublish, setPermissionToPublish] = useState(false);
  const [caseStudyInterest, setCaseStudyInterest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmitTestimonial() {
    if (testimonial.trim().length < 10 || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          email,
          tier,
          npsScore,
          testimonial: testimonial.trim(),
          displayName: displayName.trim() || null,
          companyName: companyName.trim() || null,
          roleTitle: roleTitle.trim() || null,
          permissionToPublish,
          caseStudyInterest,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px 24px",
          background: `${GREEN}08`,
          borderRadius: 12,
          border: `1px solid ${GREEN}30`,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
          Thank you for sharing your experience!
        </h3>
        <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: 0 }}>
          {caseStudyInterest
            ? "We\u2019ll be in touch about the case study opportunity."
            : "Your testimonial means the world to us."}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: LIGHT_BG,
        borderRadius: 12,
        padding: "24px",
        border: `1px solid ${BORDER}`,
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: NAVY,
          margin: "0 0 4px",
        }}
      >
        Would you share a quick testimonial?
      </h3>
      <p style={{ fontSize: 13, color: SUB, margin: "0 0 16px", lineHeight: 1.5 }}>
        A few sentences about your experience helps others discover WunderBrand Suite&#8482; and
        helps us keep improving.
      </p>

      {/* Testimonial text */}
      <textarea
        value={testimonial}
        onChange={(e) => setTestimonial(e.target.value)}
        placeholder="What did you gain from the experience? How has it helped your brand?"
        maxLength={5000}
        rows={4}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 8,
          border: `1.5px solid ${BORDER}`,
          fontSize: 14,
          fontFamily: "'Lato', system-ui, sans-serif",
          color: NAVY,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: 12,
        }}
      />

      {/* Attribution fields */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: SUB,
          textTransform: "uppercase" as const,
          letterSpacing: 1,
          margin: "0 0 8px",
        }}
      >
        How should we credit you? (optional)
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          maxLength={200}
          style={inputStyle}
        />
        <input
          type="text"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="Your role / title"
          maxLength={200}
          style={inputStyle}
        />
      </div>
      <input
        type="text"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Company or brand name"
        maxLength={200}
        style={{ ...inputStyle, width: "100%", marginBottom: 16 }}
      />

      {/* Permission checkboxes */}
      <label style={checkboxLabelStyle}>
        <input
          type="checkbox"
          checked={permissionToPublish}
          onChange={(e) => setPermissionToPublish(e.target.checked)}
          style={checkboxStyle}
        />
        <span>
          I give permission to feature my testimonial on the WunderBrand Suite&#8482; website
        </span>
      </label>

      <label style={{ ...checkboxLabelStyle, marginTop: 8 }}>
        <input
          type="checkbox"
          checked={caseStudyInterest}
          onChange={(e) => setCaseStudyInterest(e.target.checked)}
          style={checkboxStyle}
        />
        <span>
          I&#8217;m open to being featured as a case study (we&#8217;ll reach out to discuss)
        </span>
      </label>

      {error && (
        <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, textAlign: "center" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmitTestimonial}
        disabled={testimonial.trim().length < 10 || submitting}
        style={{
          width: "100%",
          height: 44,
          marginTop: 16,
          borderRadius: 8,
          border: "none",
          background: testimonial.trim().length >= 10 ? BLUE : `${BLUE}40`,
          color: WHITE,
          fontSize: 14,
          fontWeight: 700,
          cursor: testimonial.trim().length >= 10 && !submitting ? "pointer" : "default",
          transition: "background 0.2s",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Submitting..." : "Share My Testimonial"}
      </button>
    </div>
  );
}

// ─── Shared input styles ───
const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${BORDER}`,
  fontSize: 14,
  fontFamily: "'Lato', system-ui, sans-serif",
  color: NAVY,
  outline: "none",
  boxSizing: "border-box",
};

const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  fontSize: 13,
  color: NAVY,
  lineHeight: 1.4,
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  marginTop: 2,
  accentColor: BLUE,
  width: 16,
  height: 16,
  flexShrink: 0,
};

// ═══════════════════════════════════════════
// Main NPS Page
// ═══════════════════════════════════════════
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
    if (selectedScore === null || submitting) return;
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
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // ═══════════════════════════════════════════
  // PROMOTER Thank You + Testimonial + Review CTA
  // ═══════════════════════════════════════════
  if (submitted && category === "promoter") {
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
            maxWidth: 600,
            width: "100%",
            background: WHITE,
            borderRadius: 12,
            padding: "40px 36px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: `1px solid ${BORDER}`,
          }}
        >
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `${GREEN}14`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 16,
              }}
            >
              &#9734;
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
              You just made our day!
            </h1>
            <p style={{ fontSize: 15, color: SUB, lineHeight: 1.6, margin: 0 }}>
              We&#8217;re thrilled you had a great experience. Your support means everything to a
              small team like ours.
            </p>
          </div>

          {/* Testimonial Capture */}
          <div style={{ marginBottom: 24 }}>
            <TestimonialCapture
              reportId={reportId}
              email={email}
              tier={tier}
              npsScore={selectedScore!}
            />
          </div>

          {/* Google Review CTA */}
          {GOOGLE_REVIEW_URL && (
            <div
              style={{
                textAlign: "center",
                padding: "20px 24px",
                background: `${BLUE}08`,
                borderRadius: 10,
                border: `1px solid ${BLUE}20`,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: NAVY,
                  margin: "0 0 6px",
                }}
              >
                Leave us a Google review?
              </p>
              <p style={{ fontSize: 13, color: SUB, margin: "0 0 12px", lineHeight: 1.5 }}>
                A quick review helps other business owners find us. It takes less than a minute.
              </p>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 40,
                  padding: "0 24px",
                  borderRadius: 8,
                  background: WHITE,
                  color: NAVY,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  border: `1.5px solid ${BORDER}`,
                  transition: "border-color 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Write a Google Review
              </a>
            </div>
          )}

          {/* Dashboard link */}
          <div style={{ textAlign: "center" }}>
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
        </div>
      </main>
    );
  }

  // ═══════════════════════════════════════════
  // PASSIVE / DETRACTOR Thank You (standard)
  // ═══════════════════════════════════════════
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
            {category === "passive" ? "\uD83D\uDC4D" : "\uD83D\uDE4F"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>
            Thank you for your feedback
          </h1>
          <p style={{ fontSize: 15, color: SUB, lineHeight: 1.6, margin: "0 0 24px" }}>
            Your response helps us make WunderBrand Suite&#8482; better for everyone.
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

  // ═══════════════════════════════════════════
  // NPS Survey Form
  // ═══════════════════════════════════════════
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
            How likely are you to recommend WunderBrand Suite&#8482;?
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
