"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { persistEmail, getPersistedEmail } from "@/lib/persistEmail";
import {
  POST_PURCHASE_COPY,
  type PostPurchaseTier,
} from "@/content/postPurchaseCopy";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const GREEN = "#22C55E";

function parseTier(param: string | null): PostPurchaseTier {
  if (param === "blueprint") return "blueprint";
  if (param === "blueprint-plus") return "blueprint-plus";
  return "snapshot-plus";
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const product = parseTier(searchParams.get("product"));
  const reportId = searchParams.get("reportId");
  const emailParam = searchParams.get("email");
  const sessionId = searchParams.get("session_id");
  const copy = POST_PURCHASE_COPY[product];

  const [customerFirstName, setCustomerFirstName] = useState<string | null>(
    null
  );
  const [tierToken, setTierToken] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(
    emailParam || getPersistedEmail()
  );

  useEffect(() => {
    if (emailParam) {
      persistEmail(emailParam);
      setCustomerEmail(emailParam);
    }
    if (sessionId) {
      fetch(`/api/stripe/session-email?session_id=${sessionId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.email) {
            persistEmail(data.email);
            setCustomerEmail(data.email);
          }
          if (data?.name) {
            setCustomerFirstName(data.name.split(/\s+/)[0]);
          }
          if (data?.tierToken) {
            setTierToken(data.tierToken);
          }
        })
        .catch(() => {});
    }
  }, [emailParam, sessionId]);

  const startHref = `/?tier=${product}${customerFirstName ? `&name=${encodeURIComponent(customerFirstName)}` : ""}${tierToken ? `&token=${encodeURIComponent(tierToken)}` : ""}`;

  return (
    <main
      style={{
        maxWidth: 660,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "var(--font-brand)",
      }}
    >
      {/* ═══ HEADER ═══ */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div
          aria-hidden="true"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `${GREEN}12`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 36, height: 36 }}>
            <circle cx="12" cy="12" r="10" stroke={GREEN} strokeWidth="2" />
            <path
              d="M8 12l3 3 5-5"
              stroke={GREEN}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            color: GREEN,
            margin: "0 0 10px",
          }}
        >
          {copy.eyebrow}
        </p>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: NAVY,
            margin: "0 0 10px",
            letterSpacing: "-0.5px",
          }}
        >
          {copy.headline}
        </h1>

        <p
          style={{
            fontSize: 15,
            color: SUB,
            lineHeight: 1.6,
            margin: "0 auto",
            maxWidth: 520,
          }}
        >
          {copy.subhead}
        </p>
      </div>

      {/* ═══ PURCHASE REINFORCEMENT ═══ */}
      <div
        style={{
          background: LIGHT_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "22px 26px",
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: SUB,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {copy.reinforcement}
        </p>
      </div>

      {/* ═══ SECTION 1: WHAT TO HAVE HANDY ═══ */}
      <div
        style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "26px 28px",
          marginBottom: 28,
        }}
      >
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: NAVY,
            margin: "0 0 8px",
          }}
        >
          {copy.checklist.headline}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: SUB,
            lineHeight: 1.6,
            margin: "0 0 20px",
          }}
        >
          {copy.checklist.subtext}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {copy.checklist.items.map((item, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  border: `2px solid ${BORDER}`,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: NAVY,
                  }}
                >
                  {item.bold}
                </span>
                <span style={{ fontSize: 14, color: NAVY }}> — </span>
                <span
                  style={{
                    fontSize: 13,
                    color: SUB,
                    lineHeight: 1.55,
                  }}
                >
                  {item.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        {copy.checklist.uploadNote && (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              background: `${BLUE}06`,
              border: `1px solid ${BLUE}20`,
              borderRadius: 8,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: SUB,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={BLUE}
                width="14"
                height="14"
                style={{
                  display: "inline-block",
                  verticalAlign: "-2px",
                  marginRight: 6,
                }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 3.5 18.5 8H14V3.5ZM6 20V4h6v6h6v10H6Z" />
              </svg>
              {copy.checklist.uploadNote}
            </p>
          </div>
        )}
      </div>

      {/* ═══ SECTION 2: HOW IT WORKS ═══ */}
      <div
        style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "26px 28px",
          marginBottom: 28,
        }}
      >
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: NAVY,
            margin: "0 0 18px",
          }}
        >
          How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {copy.steps.map((step, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `${BLUE}12`,
                  color: BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: SUB,
                    lineHeight: 1.6,
                  }}
                >
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 3: NO RUSH ═══ */}
      <div
        style={{
          background: `${GREEN}04`,
          border: `1px solid ${GREEN}20`,
          borderRadius: 10,
          padding: "22px 26px",
          marginBottom: 36,
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: NAVY,
            margin: "0 0 8px",
          }}
        >
          No rush — this works on your schedule
        </h2>
        <p
          style={{
            fontSize: 13,
            color: SUB,
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {copy.noRush.body}
        </p>
        {copy.noRush.extra && (
          <p
            style={{
              fontSize: 13,
              color: NAVY,
              lineHeight: 1.6,
              margin: "12px 0 0",
              fontWeight: 600,
            }}
          >
            {copy.noRush.extra}
          </p>
        )}
      </div>

      {/* ═══ CTAs ═══ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
        }}
      >
        <a
          href={startHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
            height: 54,
            borderRadius: 8,
            background: BLUE,
            color: WHITE,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
        >
          {copy.primaryCta}
        </a>

        {reportId && (
          <a
            href={`/report/${reportId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: 400,
              height: 48,
              borderRadius: 8,
              border: `2px solid ${BORDER}`,
              background: WHITE,
              color: NAVY,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            View existing report →
          </a>
        )}

        <a
          href="/dashboard"
          style={{
            fontSize: 14,
            color: BLUE,
            fontWeight: 600,
            textDecoration: "none",
            padding: "10px 0",
          }}
        >
          {copy.secondaryCta}
        </a>
      </div>

      {/* ═══ REASSURANCE ═══ */}
      {customerEmail && (
        <p
          style={{
            fontSize: 13,
            color: SUB,
            textAlign: "center",
            marginTop: 16,
            lineHeight: 1.55,
          }}
        >
          {copy.reassurance(customerEmail)}
        </p>
      )}

      {/* ═══ SECURITY NOTE ═══ */}
      <p
        style={{
          fontSize: 12,
          color: SUB,
          textAlign: "center",
          marginTop: 28,
          lineHeight: 1.5,
          opacity: 0.7,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={BLUE}
          width="13"
          height="13"
          style={{
            display: "inline-block",
            verticalAlign: "-1px",
            marginRight: 4,
          }}
        >
          <path d="M18 10h-1V7A5 5 0 0 0 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9 7a3 3 0 1 1 6 0v3H9V7Z" />
        </svg>
        Your payment was processed securely. Your diagnostic data and report
        contents are confidential and will not be shared with third parties.
      </p>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-live="polite"
          style={{
            textAlign: "center",
            padding: "64px 24px",
            fontFamily: "var(--font-brand)",
            color: SUB,
          }}
        >
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
