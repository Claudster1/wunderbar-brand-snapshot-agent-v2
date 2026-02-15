"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { persistEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const GREEN = "#22C55E";

const PRODUCT_NAMES: Record<string, string> = {
  "snapshot-plus": "WunderBrand Snapshot+™",
  blueprint: "WunderBrand Blueprint™",
  "blueprint-plus": "WunderBrand Blueprint+™",
};

const PRODUCT_TIME_ESTIMATES: Record<string, string> = {
  "snapshot-plus": "20–30 minute",
  blueprint: "20–30 minute",
  "blueprint-plus": "20–30 minute",
};

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "snapshot-plus":
    "Your report includes pillar-level analysis, brand persona insights, strategic action plan, and 8 AI prompts calibrated to your brand.",
  blueprint:
    "Your report includes a complete brand operating system, messaging framework, competitive positioning, and 16 AI prompts.",
  "blueprint-plus":
    "Your report includes everything in WunderBrand Blueprint™ plus implementation guides, advanced messaging matrix, 28 AI prompts, and a complimentary 30-minute Strategy Activation Session.",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product") || "snapshot-plus";
  const reportId = searchParams.get("reportId");
  const emailParam = searchParams.get("email");
  const sessionId = searchParams.get("session_id");
  const productName = PRODUCT_NAMES[product] || "WunderBrand Snapshot+™";
  const [customerFirstName, setCustomerFirstName] = useState<string | null>(null);
  const [tierToken, setTierToken] = useState<string | null>(null);

  // Persist email and retrieve customer name + tier token from Stripe session.
  useEffect(() => {
    if (emailParam) {
      persistEmail(emailParam);
    }
    if (sessionId) {
      fetch(`/api/stripe/session-email?session_id=${sessionId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.email) persistEmail(data.email);
          if (data?.name) {
            const first = data.name.split(/\s+/)[0];
            setCustomerFirstName(first);
          }
          if (data?.tierToken) {
            setTierToken(data.tierToken);
          }
        })
        .catch(() => {});
    }
  }, [emailParam, sessionId]);

  const productDescription = PRODUCT_DESCRIPTIONS[product] || PRODUCT_DESCRIPTIONS["snapshot-plus"];
  const isBlueprintPlus = product === "blueprint-plus";

  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      style={{
        maxWidth: 620,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "var(--font-brand)",
      }}
    >
      {/* Success icon */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
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
            position: "relative",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 36, height: 36 }}>
            <circle cx="12" cy="12" r="10" stroke={GREEN} strokeWidth="2" />
            <path d="M8 12l3 3 5-5" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {showConfetti && (
            <div aria-hidden="true" style={{ position: "absolute", top: -4, right: -4, fontSize: 20, animation: "fadeIn 0.3s ease" }}>
              ✨
            </div>
          )}
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 700, color: NAVY, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          You're all set
        </h1>
        <p style={{ fontSize: 18, color: BLUE, fontWeight: 600, margin: 0 }}>
          {productName}
        </p>
      </div>

      {/* What's included card */}
      <div
        style={{
          background: LIGHT_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "24px 28px",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 10px" }}>
          What's included in your report
        </h2>
        <p style={{ fontSize: 14, color: SUB, lineHeight: 1.65, margin: 0 }}>
          {productDescription}
        </p>
      </div>

      {/* Next steps */}
      <div
        style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "24px 28px",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 16px" }}>
          What happens next
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              step: "1",
              title: "Complete your brand diagnostic",
              detail: `Wundy™ will guide you through a ${PRODUCT_TIME_ESTIMATES[product] || "15–20 minute"} conversation about your brand, audience, and goals. No prep needed — just answer naturally.`,
            },
            {
              step: "2",
              title: "Get your personalized report",
              detail: `Your ${productName} report is generated instantly when the diagnostic is complete — including your WunderBrand Score™, pillar analysis, and personalized recommendations.`,
            },
            {
              step: "3",
              title: isBlueprintPlus
                ? "Book your Strategy Activation Session"
                : "Put your insights to work",
              detail: isBlueprintPlus
                ? "Your WunderBrand Blueprint+™ includes a complimentary 30-minute session with a strategist. We recommend booking within 30 days while your diagnostic data is fresh."
                : "Use the AI prompts in your report to start implementing your brand strategy right away.",
            },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `${BLUE}12`,
                  color: BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: SUB, lineHeight: 1.55 }}>
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary CTA — Start Diagnostic */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <a
          href={`/?tier=${product}${customerFirstName ? `&name=${encodeURIComponent(customerFirstName)}` : ""}${tierToken ? `&token=${encodeURIComponent(tierToken)}` : ""}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 360,
            height: 52,
            borderRadius: 8,
            background: BLUE,
            color: WHITE,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
        >
          Start your {productName} →
        </a>

        {reportId && (
          <a
            href={`/report/${reportId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: 360,
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
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 360,
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
          Go to my dashboard
        </a>

        {isBlueprintPlus && (
          <a
            href="https://calendly.com/wunderbardigital/brand-strategy-activation?utm_source=checkout_success&utm_medium=cta_button&utm_campaign=session_booking&utm_content=strategy_activation"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: 360,
              height: 48,
              borderRadius: 8,
              border: `2px solid ${BLUE}`,
              background: `${BLUE}08`,
              color: BLUE,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            Book Strategy Activation Session →
          </a>
        )}
      </div>

      {/* Security note */}
      <p
        style={{
          fontSize: 12,
          color: "#5A6B7E",
          textAlign: "center",
          marginTop: 32,
          lineHeight: 1.5,
        }}
      >
        🔒 Your payment was processed securely. Your diagnostic data and report
        contents are confidential and will not be shared with third parties.
      </p>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div role="status" aria-live="polite" style={{ textAlign: "center", padding: "64px 24px", fontFamily: "var(--font-brand)", color: "#5A6B7E" }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
