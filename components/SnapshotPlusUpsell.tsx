// components/SnapshotPlusUpsell.tsx

import { snapshotPlusCopy } from "@/src/content/snapshotPlus.copy";

export default function SnapshotPlusUpsell({
  href = "/checkout/snapshot-plus",
  copy,
  businessName,
}: {
  href?: string;
  copy?: string;
  businessName?: string;
}) {
  const ctaText = businessName
    ? snapshotPlusCopy.cta.getPlan(businessName)
    : snapshotPlusCopy.cta.primary;

  return (
    <div
      style={{
        background: "#021859",
        color: "#FFF",
        padding: "40px",
        borderRadius: "16px",
        marginTop: "48px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>
        Upgrade to Brand Snapshot+™
      </h2>

      <p style={{ maxWidth: 520, margin: "0 auto", lineHeight: 1.55 }}>
        {copy ||
          "Unlock your fully customized strategic brand package — including tailored messaging, narrative frameworks, visual guidance, buyer insights, color palette recommendations, and AI-ready prompts that keep your brand consistent across every channel."}
      </p>

      <a
        href={href}
        style={{
          display: "inline-block",
          marginTop: 24,
          background: "#07B0F2",
          padding: "14px 24px",
          color: "#FFF",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
          boxShadow: "0 6px 22px rgba(7,176,242,0.45)",
        }}
      >
        {ctaText} →
      </a>
    </div>
  );
}


