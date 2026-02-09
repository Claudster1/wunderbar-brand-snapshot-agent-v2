// app/refine/[reportId]/page.tsx
// Refinement chat page — users add context to strengthen their analysis
"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useRefinementChat } from "@/src/hooks/useRefinementChat";
import Image from "next/image";

/* ─── Brand tokens ─── */
const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const GREEN = "#22C55E";
const RED = "#EF4444";

export default function RefinePage() {
  const params = useParams();
  const reportId = params?.reportId as string;

  const {
    messages,
    isLoading,
    loadingReport,
    error,
    reportData,
    isComplete,
    updatedScores,
    previousScores,
    sendMessage,
    viewUpdatedReport,
  } = useRefinementChat(reportId);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages, isLoading]);

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isLoading, messages]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    await sendMessage(inputValue);
    setInputValue("");
  };

  // Score change indicator
  const ScoreDelta = ({ before, after, label }: { before: number; after: number; label: string }) => {
    const delta = after - before;
    const color = delta > 0 ? GREEN : delta < 0 ? RED : SUB;
    const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "–";
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: SUB }}>{before}</span>
          <span style={{ fontSize: 13, color: SUB }}>→</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{after}</span>
          {delta !== 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color, padding: "2px 6px", borderRadius: 4, background: `${color}15` }}>
              {arrow}{Math.abs(delta)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loadingReport) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: LIGHT_BG, fontFamily: "Lato, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${BORDER}`, borderTopColor: BLUE, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
          <p style={{ fontSize: 15, color: SUB, fontWeight: 600 }}>Loading your report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: LIGHT_BG, fontFamily: "Lato, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Something went wrong</p>
          <p style={{ fontSize: 14, color: SUB, marginBottom: 24 }}>{error}</p>
          <a href="/dashboard" style={{ fontSize: 14, color: BLUE, fontWeight: 700, textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: LIGHT_BG, fontFamily: "Lato, sans-serif" }}>
      {/* Header */}
      <header style={{
        background: WHITE,
        borderBottom: `1px solid ${BORDER}`,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="https://wunderbardigital.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp"
              alt="Wunderbar Digital"
              width={160}
              height={28}
              style={{ display: "block" }}
            />
          </a>
          <div style={{ width: 1, height: 24, background: BORDER, margin: "0 4px" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Refine Your Analysis
          </span>
        </div>
        {reportData && (
          <div style={{ fontSize: 13, color: SUB }}>
            <span style={{ fontWeight: 700, color: NAVY }}>{reportData.businessName}</span>
            {" · "}
            <span>Score: {reportData.brandAlignmentScore}/100</span>
          </div>
        )}
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {/* Context card */}
        {reportData && !isComplete && (
          <div style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: "18px 22px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            {/* Mini gauge */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `conic-gradient(${BLUE} ${(reportData.brandAlignmentScore / 100) * 360}deg, ${BORDER} 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: NAVY,
              }}>
                {reportData.brandAlignmentScore}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 2 }}>
                Current Brand Alignment Score™
              </div>
              <div style={{ fontSize: 13, color: SUB, lineHeight: 1.4 }}>
                Answer a few follow-up questions to strengthen your analysis and potentially improve your score.
              </div>
            </div>
          </div>
        )}

        {/* Completion card with score comparison */}
        {isComplete && updatedScores && previousScores && (
          <div style={{
            background: WHITE,
            border: `2px solid ${BLUE}30`,
            borderRadius: 12,
            padding: "24px",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20 }}>
                <circle cx="10" cy="10" r="10" fill={`${GREEN}15`} />
                <path d="M6 10l3 3 5-5" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 16, fontWeight: 900, color: NAVY }}>
                Analysis Updated
              </span>
            </div>

            <ScoreDelta
              label="Brand Alignment Score™"
              before={previousScores.brandAlignmentScore}
              after={updatedScores.brandAlignmentScore}
            />

            {Object.entries(updatedScores.pillarScores).map(([pillar, score]) => (
              <ScoreDelta
                key={pillar}
                label={pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                before={previousScores.pillarScores[pillar] || 0}
                after={score}
              />
            ))}

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                onClick={viewUpdatedReport}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: BLUE,
                  color: WHITE,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "Lato, sans-serif",
                }}
              >
                View Updated Report →
              </button>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {/* Chat header */}
          <div style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <Image
              src="/assets/wundy-logo.jpeg"
              alt="Wundy"
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Wundy</div>
              <div style={{ fontSize: 11, color: SUB }}>Brand Refinement Guide</div>
            </div>
            {isLoading && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, animation: "bounce 1.4s ease infinite" }} />
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, animation: "bounce 1.4s ease infinite 0.2s" }} />
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, animation: "bounce 1.4s ease infinite 0.4s" }} />
                <style dangerouslySetInnerHTML={{ __html: `@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }` }} />
              </div>
            )}
          </div>

          {/* Messages area */}
          <div style={{
            padding: "16px 20px",
            minHeight: 300,
            maxHeight: "calc(100vh - 420px)",
            overflowY: "auto",
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 16px",
                    borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: msg.role === "user" ? BLUE : LIGHT_BG,
                    color: msg.role === "user" ? WHITE : NAVY,
                    fontSize: 14,
                    lineHeight: 1.55,
                    fontFamily: "Lato, sans-serif",
                  }}
                >
                  {msg.text.split("\n\n").map((p, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
                      {p.split("\n").map((line, j) => (
                        <span key={j}>
                          {j > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                <div style={{
                  padding: "10px 16px",
                  borderRadius: "12px 12px 12px 2px",
                  background: LIGHT_BG,
                  color: SUB,
                  fontSize: 14,
                  fontStyle: "italic",
                }}>
                  Wundy is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {!isComplete && (
            <form
              onSubmit={handleSubmit}
              style={{
                padding: "12px 16px",
                borderTop: `1px solid ${BORDER}`,
                display: "flex",
                gap: 10,
                background: LIGHT_BG,
              }}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your reply..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${BORDER}`,
                  background: WHITE,
                  fontSize: 14,
                  color: NAVY,
                  outline: "none",
                  fontFamily: "Lato, sans-serif",
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: isLoading || !inputValue.trim() ? `${BLUE}50` : BLUE,
                  color: WHITE,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isLoading || !inputValue.trim() ? "default" : "pointer",
                  fontFamily: "Lato, sans-serif",
                  transition: "background 0.2s ease",
                }}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </form>
          )}
        </div>

        {/* Footer tip */}
        {!isComplete && (
          <p style={{ textAlign: "center", fontSize: 12, color: SUB, marginTop: 16, lineHeight: 1.4 }}>
            This refinement adds context to your existing analysis. Your original data is preserved.
          </p>
        )}
      </div>
    </div>
  );
}
