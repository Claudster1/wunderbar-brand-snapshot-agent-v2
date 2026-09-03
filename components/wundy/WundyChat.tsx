// components/wundy/WundyChat.tsx
// Floating Wundy™ chat widget — works in both General Guide and Report Companion modes.
// Mobile: near full-screen sheet with safe-area + keyboard-aware height so input is never cut off.

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWundyChat, WundyChatMode, WundySessionMeta } from "@/src/hooks/useWundyChat";
import WundyLogo from "@/src/assets/wundy-logo.jpeg";
import { staticImageUrl } from "@/lib/staticImageUrl";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";

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
const WUNDY_AVATAR_SRC = staticImageUrl(WundyLogo);
const WUNDY_AVATAR_FALLBACK = "/assets/og/wundy-outline.svg";
const WUNDY_AVATAR_FINAL_FALLBACK = staticImageUrl(WundyLogo);

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
  const [avatarSrc, setAvatarSrc] = useState<string>(WUNDY_AVATAR_SRC);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearChat } = useWundyChat({
    mode,
    reportId,
    tier,
    greeting,
    sessionMeta,
  });

  // Keep composer visible above mobile keyboard / dynamic viewport.
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const syncHeight = () => {
      const vv = window.visualViewport;
      const h = vv?.height ?? window.innerHeight;
      setPanelHeight(Math.round(h));
    };

    syncHeight();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncHeight);
    vv?.addEventListener("scroll", syncHeight);
    window.addEventListener("resize", syncHeight);
    return () => {
      vv?.removeEventListener("resize", syncHeight);
      vv?.removeEventListener("scroll", syncHeight);
      window.removeEventListener("resize", syncHeight);
    };
  }, [isOpen]);

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-wundy-open", "1");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.removeAttribute("data-wundy-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

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

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ message?: string; autoSend?: boolean; open?: boolean }>;
      if (custom.detail?.open) {
        setIsOpen(true);
        setShowBubble(false);
        return;
      }
      const message = custom.detail?.message?.trim();
      if (!message) return;
      setIsOpen(true);
      setShowBubble(false);
      if (custom.detail?.autoSend) {
        sendMessage(message);
        setInput("");
      } else {
        setInput(message);
      }
    };

    window.addEventListener("wundy:ask", handler as EventListener);
    return () => window.removeEventListener("wundy:ask", handler as EventListener);
  }, [sendMessage]);

  const modeLabel = mode === "report" ? "Report Companion" : "Brand Guide";
  const bubbleColor = accentColor;
  const bubbleTextColor = WHITE;

  return (
    <>
      {!isOpen && (
        <div
          className="wundy-fab"
          role="button"
          tabIndex={0}
          aria-label="Open Wundy™ chat"
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <div
            className="wundy-fab-bubble"
            style={{
              height: showBubble ? 100 : 0,
              opacity: showBubble ? 1 : 0,
              animation: showBubble ? "wundyBubbleIn 0.5s ease-out 1s both" : "none",
            }}
          >
            <svg viewBox="0 0 220 100" width={220} height={100} style={{ position: "absolute", top: 0, left: 0 }}>
              <ellipse cx="60" cy="20" rx="30" ry="18" fill={bubbleColor} />
              <ellipse cx="95" cy="14" rx="34" ry="14" fill={bubbleColor} />
              <ellipse cx="135" cy="16" rx="32" ry="16" fill={bubbleColor} />
              <ellipse cx="168" cy="22" rx="26" ry="18" fill={bubbleColor} />
              <ellipse cx="32" cy="34" rx="26" ry="20" fill={bubbleColor} />
              <ellipse cx="188" cy="36" rx="24" ry="20" fill={bubbleColor} />
              <ellipse cx="110" cy="34" rx="78" ry="24" fill={bubbleColor} />
              <ellipse cx="55" cy="50" rx="32" ry="16" fill={bubbleColor} />
              <ellipse cx="105" cy="52" rx="36" ry="14" fill={bubbleColor} />
              <ellipse cx="155" cy="50" rx="32" ry="16" fill={bubbleColor} />
              <circle cx="182" cy="72" r="9" fill={bubbleColor} />
              <circle cx="196" cy="86" r="5.5" fill={bubbleColor} />
            </svg>
            <div className="wundy-fab-bubble-text" style={{ color: bubbleTextColor }}>
              Questions? Ask Wundy™.
            </div>
          </div>

          <div className="wundy-fab-avatar">
            <img
              src={avatarSrc}
              alt=""
              width={44}
              height={44}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              onError={() => {
                if (avatarSrc === WUNDY_AVATAR_SRC) {
                  setAvatarSrc(WUNDY_AVATAR_FALLBACK);
                } else if (avatarSrc === WUNDY_AVATAR_FALLBACK) {
                  setAvatarSrc(WUNDY_AVATAR_FINAL_FALLBACK);
                }
              }}
            />
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="wundy-chat-panel"
          style={
            panelHeight
              ? ({ ["--wundy-vvh" as string]: `${panelHeight}px` } as React.CSSProperties)
              : undefined
          }
          role="dialog"
          aria-label="Wundy™ chat"
          aria-modal="true"
        >
          <div className="wundy-chat-header" style={{ background: NAVY, color: WHITE }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div className="wundy-chat-header-avatar">
                <img
                  src={avatarSrc}
                  alt=""
                  width={32}
                  height={32}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                  onError={() => {
                    if (avatarSrc === WUNDY_AVATAR_SRC) {
                      setAvatarSrc(WUNDY_AVATAR_FALLBACK);
                    } else if (avatarSrc === WUNDY_AVATAR_FALLBACK) {
                      setAvatarSrc(WUNDY_AVATAR_FINAL_FALLBACK);
                    }
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>Wundy™</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.2, color: BLUE, fontWeight: 500 }}>{modeLabel}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <button type="button" onClick={clearChat} title="Clear chat" className="wundy-chat-header-btn">
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="wundy-chat-header-btn wundy-chat-header-btn-icon"
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>
          </div>

          <div
            ref={messagesScrollRef}
            className="wundy-chat-messages"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
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
                {msg.role === "assistant" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={avatarSrc}
                      alt=""
                      width={26}
                      height={26}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                      onError={() => {
                        if (avatarSrc === WUNDY_AVATAR_SRC) {
                          setAvatarSrc(WUNDY_AVATAR_FALLBACK);
                        } else if (avatarSrc === WUNDY_AVATAR_FALLBACK) {
                          setAvatarSrc(WUNDY_AVATAR_FINAL_FALLBACK);
                        }
                      }}
                    />
                  </div>
                )}
                <div
                  className={msg.role === "user" ? "wundy-msg-user" : "wundy-msg-assistant"}
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
                    wordBreak: "break-word",
                  }}
                >
                  <ChatMarkdown text={msg.text} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div role="status" aria-label="Wundy™ is typing" style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={avatarSrc}
                    alt=""
                    width={26}
                    height={26}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                    onError={() => {
                      if (avatarSrc === WUNDY_AVATAR_SRC) {
                        setAvatarSrc(WUNDY_AVATAR_FALLBACK);
                      } else if (avatarSrc === WUNDY_AVATAR_FALLBACK) {
                        setAvatarSrc(WUNDY_AVATAR_FINAL_FALLBACK);
                      }
                    }}
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

          <div className="wundy-chat-composer">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Wundy™ anything..."
              aria-label="Ask Wundy™ a question"
              disabled={isLoading}
              enterKeyHint="send"
              autoComplete="off"
              className="wundy-chat-input"
              style={{
                border: `1px solid ${BORDER}`,
                color: NAVY,
                background: LIGHT_BG,
              }}
            />
            <button
              type="button"
              aria-label="Send message"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="wundy-chat-send"
              style={{
                background: input.trim() && !isLoading ? accentColor : `${accentColor}40`,
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              }}
            >
              Send
            </button>
          </div>

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
