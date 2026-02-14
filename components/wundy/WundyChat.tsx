// components/wundy/WundyChat.tsx
// Floating Wundy™ chat widget — works in both General Guide and Report Companion modes.

"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useWundyChat, WundyChatMode, WundySessionMeta } from "@/src/hooks/useWundyChat";

type WundyChatProps = {
  /** Chat mode: "general" for everyone, "report" for paid tier report pages */
  mode: WundyChatMode;
  /** Report ID — required for "report" mode */
  reportId?: string;
  /** Product tier key — required for "report" mode */
  tier?: "snapshot-plus" | "blueprint" | "blueprint-plus";
  /** Optional custom greeting */
  greeting?: string;
  /** Primary brand color — defaults to Wunderbar blue */
  accentColor?: string;
  /** Auto-collected session context for support (userId, stripeSessionId, acContactId) */
  sessionMeta?: WundySessionMeta;
};

const BLUE = "#07B0F2";
const NAVY = "#0B1D3A";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F8F9FB";
const BORDER = "#E2E8F0";
const SUB = "#64748B";

export default function WundyChat({
  mode,
  reportId,
  tier,
  greeting,
  accentColor = BLUE,
  sessionMeta,
}: WundyChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showBubble, setShowBubble] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearChat } = useWundyChat({
    mode,
    reportId,
    tier,
    greeting,
    sessionMeta,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Auto-hide thought bubble after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const modeLabel = mode === "report" ? "Report Companion" : "Brand Guide";

  return (
    <>
      {/* ─── Floating Wundy™ Avatar + Speech Bubble ─── */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            cursor: "pointer",
          }}
          onClick={() => setIsOpen(true)}
        >
          {/* Thought bubble — puffy white cloud, auto-hides after 10s */}
          <div
            style={{
              position: "relative",
              width: 220,
              height: showBubble ? 100 : 0,
              marginBottom: 0,
              animation: showBubble ? "wundyBubbleIn 0.5s ease-out 1s both" : "none",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.10))",
              opacity: showBubble ? 1 : 0,
              overflow: "hidden",
              transition: "opacity 0.5s ease, height 0.5s ease",
            }}
          >
            {/* SVG cloud + trailing thought circles */}
            <svg
              viewBox="0 0 220 100"
              width={220}
              height={100}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* Puffy cloud body — many overlapping ellipses for organic shape */}
              {/* Top bumps */}
              <ellipse cx="60"  cy="20" rx="30" ry="18" fill={WHITE} />
              <ellipse cx="95"  cy="14" rx="34" ry="14" fill={WHITE} />
              <ellipse cx="135" cy="16" rx="32" ry="16" fill={WHITE} />
              <ellipse cx="168" cy="22" rx="26" ry="18" fill={WHITE} />
              {/* Left bump */}
              <ellipse cx="32"  cy="34" rx="26" ry="20" fill={WHITE} />
              {/* Right bump */}
              <ellipse cx="188" cy="36" rx="24" ry="20" fill={WHITE} />
              {/* Center fill */}
              <ellipse cx="110" cy="34" rx="78" ry="24" fill={WHITE} />
              {/* Bottom bumps */}
              <ellipse cx="55"  cy="50" rx="32" ry="16" fill={WHITE} />
              <ellipse cx="105" cy="52" rx="36" ry="14" fill={WHITE} />
              <ellipse cx="155" cy="50" rx="32" ry="16" fill={WHITE} />
              {/* Trailing thought circles */}
              <circle cx="182" cy="72" r="9" fill={WHITE} />
              <circle cx="196" cy="86" r="5.5" fill={WHITE} />
            </svg>
            {/* Text overlay — centered on the cloud */}
            <div
              style={{
                position: "absolute",
                top: 2,
                left: 0,
                width: 210,
                height: 66,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Lato', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: NAVY,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              Questions? Ask Wundy™.
            </div>
          </div>

          {/* Wundy™ avatar — no hard border */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: WHITE,
              border: "none",
              boxShadow: "0 3px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "scale(1.08)";
              el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.13), 0 0 0 1px rgba(7,176,242,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "scale(1)";
              el.style.boxShadow = "0 3px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)";
            }}
          >
            <Image
              src="/assets/wundy-avatar.png"
              alt="Wundy™ — Ask a question"
              width={44}
              height={44}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 390,
            maxWidth: "calc(100vw - 48px)",
            height: 560,
            maxHeight: "calc(100vh - 48px)",
            borderRadius: 16,
            background: WHITE,
            boxShadow: "0 12px 48px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 10002,
            border: `1px solid ${BORDER}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              background: NAVY,
              color: WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: WHITE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/assets/wundy-avatar.png"
                  alt="Wundy™"
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>Wundy™</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.2, color: BLUE, fontWeight: 500 }}>{modeLabel}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  borderRadius: 6,
                  color: WHITE,
                  cursor: "pointer",
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "none",
                  borderRadius: 6,
                  color: WHITE,
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: LIGHT_BG,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 8,
                  alignItems: "flex-end",
                }}
              >
                {/* Wundy™ avatar on assistant messages */}
                {msg.role === "assistant" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <Image
                      src="/assets/wundy-avatar.png"
                      alt="Wundy™"
                      width={26}
                      height={26}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user" ? accentColor : WHITE,
                    color: msg.role === "user" ? WHITE : NAVY,
                    fontSize: 14,
                    lineHeight: 1.55,
                    boxShadow: msg.role === "user" ? "none" : `0 1px 3px ${BORDER}`,
                    border: msg.role === "user" ? "none" : `1px solid ${BORDER}`,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div role="status" aria-label="Wundy™ is typing" style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Image
                    src="/assets/wundy-avatar.png"
                    alt="Wundy™"
                    width={26}
                    height={26}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 4px",
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    color: SUB,
                    fontSize: 14,
                  }}
                >
                  <span style={{ display: "inline-flex", gap: 3 }}>
                    <span style={{ animation: "wundyDot 1.4s infinite", animationDelay: "0s" }}>.</span>
                    <span style={{ animation: "wundyDot 1.4s infinite", animationDelay: "0.2s" }}>.</span>
                    <span style={{ animation: "wundyDot 1.4s infinite", animationDelay: "0.4s" }}>.</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: `1px solid ${BORDER}`,
              background: WHITE,
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Wundy™ anything..."
              aria-label="Ask Wundy™ a question"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px 14px",
                minHeight: 44,
                boxSizing: "border-box",
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                fontSize: 14,
                outline: "none",
                color: NAVY,
                background: LIGHT_BG,
              }}
            />
            <button
              aria-label="Send message"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                padding: "0 14px",
                minHeight: 44,
                borderRadius: 10,
                border: "none",
                background: input.trim() && !isLoading ? accentColor : `${accentColor}40`,
                color: WHITE,
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                fontSize: 14,
                fontWeight: 600,
                transition: "background 0.15s",
              }}
            >
              Send
            </button>
          </div>

          {/* Keyframe animations */}
          <style>{`
            @keyframes wundyDot {
              0%, 20% { opacity: 0.2; }
              50% { opacity: 1; }
              80%, 100% { opacity: 0.2; }
            }
            @keyframes wundyBubbleIn {
              0% { opacity: 0; transform: translateY(8px) scale(0.92); }
              60% { opacity: 1; transform: translateY(-3px) scale(1.02); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
