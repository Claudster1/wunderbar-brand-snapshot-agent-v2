"use client";

import { useState } from "react";
import { persistEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const GREEN = "#22C55E";

export default function AccessPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/access/send-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        persistEmail(email.trim());
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${LIGHT_BG} 0%, ${WHITE} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: WHITE,
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          padding: "48px 36px",
          boxShadow: "0 4px 24px rgba(2,24,89,0.06)",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <a
            href="https://wunderbardigital.com?utm_source=brand_snapshot_app&utm_medium=access_page&utm_campaign=logo_click"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/assets/og/logo-wunderbar.svg"
              alt="Wunderbar Digital"
              style={{ height: 36, margin: "0 auto" }}
            />
          </a>
        </div>

        <h1
          style={{
            color: NAVY,
            fontSize: 26,
            fontWeight: 700,
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          Access Your Reports
        </h1>

        <p
          style={{
            color: SUB,
            fontSize: 15,
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          Enter the email you used during your WunderBrand Suite™&#8482;
          diagnostic or purchase. We&rsquo;ll send a link to access all of your
          reports.
        </p>

        {status === "success" ? (
          <div
            style={{
              background: "#F0FDF4",
              border: `1px solid ${GREEN}`,
              borderRadius: 12,
              padding: "24px 20px",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill={GREEN} />
                <path
                  d="M12 18.5L16 22.5L24 14.5"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              style={{
                color: NAVY,
                fontSize: 16,
                fontWeight: 600,
                margin: "0 0 6px",
              }}
            >
              Check your inbox
            </p>
            <p style={{ color: SUB, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              If we have reports associated with that email, you&rsquo;ll receive
              a link shortly. Be sure to check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16, textAlign: "left" }}>
              <label
                htmlFor="access-email"
                style={{
                  display: "block",
                  color: NAVY,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Email address
              </label>
              <input
                id="access-email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  color: NAVY,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = BLUE)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = BORDER)
                }
              />
            </div>

            {status === "error" && (
              <p
                style={{
                  color: "#DC2626",
                  fontSize: 14,
                  margin: "0 0 12px",
                }}
              >
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: BLUE,
                color: WHITE,
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: status === "loading" ? "wait" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                transition: "opacity 0.2s, transform 0.15s",
              }}
            >
              {status === "loading" ? "Sending..." : "Send My Report Links"}
            </button>
          </form>
        )}

        {/* Divider */}
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            margin: "28px 0 20px",
          }}
        />

        <p style={{ color: SUB, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          Don&rsquo;t have a report yet?{" "}
          <a
            href="/?utm_source=brand_snapshot_app&utm_medium=access_page&utm_campaign=start_snapshot"
            style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}
          >
            Start a free WunderBrand Snapshot™&#8482;
          </a>
        </p>

        <p
          style={{
            color: SUB,
            fontSize: 12,
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Need help?{" "}
          <a
            href="https://wunderbardigital.com/talk-to-an-expert?utm_source=brand_snapshot_app&utm_medium=access_page&utm_campaign=support_routing&utm_content=talk_expert"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: BLUE, textDecoration: "none" }}
          >
            Talk to an Expert
          </a>{" "}
          or email{" "}
          <a
            href="mailto:support@wunderbardigital.com"
            style={{ color: BLUE, textDecoration: "none" }}
          >
            support@wunderbardigital.com
          </a>
        </p>
      </div>
    </div>
  );
}
