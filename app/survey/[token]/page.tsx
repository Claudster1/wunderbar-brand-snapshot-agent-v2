"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6E4F0";
const WHITE = "#FFFFFF";

const SCORE_LABELS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function SurveyPage() {
  const params = useParams();
  const token = params.token as string;

  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [words, setWords] = useState(["", "", ""]);
  const [differentiator, setDifferentiator] = useState("");
  const [discoveryChannel, setDiscoveryChannel] = useState("");
  const [friendDescription, setFriendDescription] = useState("");
  const [improvement, setImprovement] = useState("");
  const [experienceScore, setExperienceScore] = useState<number | null>(null);
  const [chooseReason, setChooseReason] = useState("");
  const [elevatorDescription, setElevatorDescription] = useState("");

  useEffect(() => {
    // Fetch survey metadata to get business name
    fetch(`/api/voc/survey-info?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.businessName) {
          setBusinessName(data.businessName);
        } else if (data.closed) {
          setError("Thank you for your interest — this survey has reached its maximum number of responses.");
        } else {
          setError("This survey is no longer available.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load survey. Please try again.");
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async () => {
    const filledWords = words.filter((w) => w.trim());
    if (filledWords.length === 0) {
      setError("Please provide at least one word that describes the brand.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/voc/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyToken: token,
          threeWords: filledWords,
          differentiator: differentiator.trim() || null,
          discoveryChannel: discoveryChannel.trim() || null,
          friendDescription: friendDescription.trim() || null,
          improvement: improvement.trim() || null,
          experienceScore,
          chooseReason: chooseReason.trim() || null,
          elevatorDescription: elevatorDescription.trim() || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lato', sans-serif", color: SUB }}>
        Loading survey...
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lato', sans-serif", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Thank you!</h1>
          <p style={{ fontSize: 16, color: SUB, lineHeight: 1.6 }}>
            Your feedback helps <strong style={{ color: NAVY }}>{businessName}</strong> understand how their brand is perceived. Your responses are anonymous and confidential.
          </p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    outline: "none",
    fontFamily: "'Lato', sans-serif",
    color: NAVY,
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 15,
    fontWeight: 600 as const,
    color: NAVY,
    display: "block",
    marginBottom: 8,
  };

  const sublabelStyle = {
    fontSize: 13,
    color: SUB,
    fontWeight: 400 as const,
    marginLeft: 4,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FB", fontFamily: "'Lato', sans-serif", padding: "32px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            Brand Perception Survey
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: "0 0 10px" }}>
            How do you experience {businessName}?
          </h1>
          <p style={{ fontSize: 15, color: SUB, lineHeight: 1.6, margin: 0 }}>
            This takes about 2 minutes. Your responses are anonymous and will help {businessName} understand how their brand is perceived.
          </p>
        </div>

        {/* Form */}
        <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Q1: Three words */}
          <div>
            <label style={labelStyle}>
              What 3 words best describe {businessName}?
              <span style={sublabelStyle}>(required)</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {words.map((w, i) => (
                <input
                  key={i}
                  type="text"
                  value={w}
                  onChange={(e) => {
                    const next = [...words];
                    next[i] = e.target.value;
                    setWords(next);
                  }}
                  placeholder={`Word ${i + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                  maxLength={50}
                />
              ))}
            </div>
          </div>

          {/* Q2: Differentiator */}
          <div>
            <label style={labelStyle}>What does {businessName} do better than alternatives?</label>
            <textarea
              value={differentiator}
              onChange={(e) => setDifferentiator(e.target.value)}
              placeholder="What stands out about their product or service..."
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              maxLength={500}
            />
          </div>

          {/* Q3: Discovery */}
          <div>
            <label style={labelStyle}>How did you first hear about {businessName}?</label>
            <input
              type="text"
              value={discoveryChannel}
              onChange={(e) => setDiscoveryChannel(e.target.value)}
              placeholder="e.g., Google search, referral, social media, event..."
              style={inputStyle}
              maxLength={200}
            />
          </div>

          {/* Q4: Friend description */}
          <div>
            <label style={labelStyle}>What would you tell a friend about {businessName}?</label>
            <textarea
              value={friendDescription}
              onChange={(e) => setFriendDescription(e.target.value)}
              placeholder="If a friend asked, how would you describe your experience..."
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              maxLength={500}
            />
          </div>

          {/* Q5: Improvement */}
          <div>
            <label style={labelStyle}>What&apos;s one thing {businessName} could improve?</label>
            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Be honest — constructive feedback is most valuable..."
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              maxLength={500}
            />
          </div>

          {/* Q6: Experience score */}
          <div>
            <label style={labelStyle}>How likely are you to recommend {businessName}?</label>
            <div style={{ display: "flex", gap: 4, justifyContent: "space-between", marginTop: 4 }}>
              {SCORE_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setExperienceScore(i)}
                  style={{
                    width: 38, height: 38, borderRadius: 8,
                    border: experienceScore === i ? `2px solid ${BLUE}` : `1px solid ${BORDER}`,
                    background: experienceScore === i ? `${BLUE}15` : WHITE,
                    color: experienceScore === i ? BLUE : SUB,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'Lato', sans-serif",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: SUB }}>Not likely</span>
              <span style={{ fontSize: 11, color: SUB }}>Extremely likely</span>
            </div>
          </div>

          {/* Q7: Why choose */}
          <div>
            <label style={labelStyle}>What made you choose {businessName} over others?</label>
            <textarea
              value={chooseReason}
              onChange={(e) => setChooseReason(e.target.value)}
              placeholder="What tipped the scales in their favor..."
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              maxLength={500}
            />
          </div>

          {/* Q8: Elevator description */}
          <div>
            <label style={labelStyle}>How would you describe {businessName} to someone who&apos;s never heard of it?</label>
            <textarea
              value={elevatorDescription}
              onChange={(e) => setElevatorDescription(e.target.value)}
              placeholder="In a sentence or two..."
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              maxLength={500}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: "#DC2626", fontSize: 14, margin: 0 }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%", padding: "14px 24px", borderRadius: 8,
              border: "none", background: BLUE, color: WHITE,
              fontSize: 16, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.7 : 1,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>

          <p style={{ fontSize: 12, color: SUB, textAlign: "center", margin: 0, lineHeight: 1.5 }}>
            Your responses are anonymous and confidential. They&apos;ll be used to help {businessName} improve their brand experience.
          </p>
        </div>
      </div>
    </div>
  );
}
