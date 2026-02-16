"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";

const PRODUCT_NAMES: Record<string, string> = {
  "snapshot-plus": "WunderBrand Snapshot+™",
  blueprint: "WunderBrand Blueprint™",
  "blueprint-plus": "WunderBrand Blueprint+™",
};

function CancelContent() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product") || "";
  const productName = PRODUCT_NAMES[product] || "";

  return (
    <main
      style={{
        maxWidth: 540,
        margin: "0 auto",
        padding: "64px 24px 80px",
        textAlign: "center",
        fontFamily: "var(--font-brand)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#FEF9E7",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
          <circle cx="12" cy="12" r="10" stroke="#EAB308" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: NAVY,
          margin: "0 0 10px",
          letterSpacing: "-0.5px",
        }}
      >
        Checkout canceled
      </h1>

      <p style={{ fontSize: 16, color: SUB, lineHeight: 1.6, margin: "0 0 12px" }}>
        No charge was made to your account.
        {productName && ` Your ${productName} diagnostic progress has been saved.`}
      </p>

      <p style={{ fontSize: 14, color: SUB, lineHeight: 1.6, margin: "0 0 32px" }}>
        If you have questions about which product is right for you, you can{" "}
        <a
          href="https://wunderbardigital.com/wunderbrand-suite?utm_source=checkout_cancel&utm_medium=text_link&utm_campaign=product_comparison&utm_content=comparison_page"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}
        >
          compare all products
        </a>{" "}
        or{" "}
        <a
          href="https://wunderbardigital.com/talk-to-an-expert?utm_source=checkout_cancel&utm_medium=text_link&utm_campaign=support_routing&utm_content=talk_expert"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}
        >
          talk to an expert
        </a>{" "}
        — it's free and no-pressure.
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 24px",
            borderRadius: 8,
            background: BLUE,
            color: WHITE,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Back to WunderBrand Snapshot™
        </a>
        <a
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 24px",
            borderRadius: 8,
            border: `2px solid ${BORDER}`,
            background: WHITE,
            color: NAVY,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          My dashboard
        </a>
      </div>
    </main>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div role="status" aria-live="polite" style={{ textAlign: "center", padding: "64px 24px", fontFamily: "var(--font-brand)", color: "#5A6B7E" }}>Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}
