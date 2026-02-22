"use client";

import { useState, useEffect } from "react";

const NAVY = "#021859";
const AMBER = "#F59E0B";
const AMBER_BG = "#FFFBEB";
const AMBER_BORDER = "#FDE68A";

type BannerData = {
  message: string;
  type: "maintenance" | "info";
  dismissible: boolean;
};

export default function MaintenanceBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const raw = process.env.NEXT_PUBLIC_MAINTENANCE_BANNER;
    if (!raw || raw.trim() === "" || raw === "false") return;

    try {
      const parsed = JSON.parse(raw);
      setBanner({
        message: parsed.message || raw,
        type: parsed.type || "maintenance",
        dismissible: parsed.dismissible !== false,
      });
    } catch {
      setBanner({ message: raw, type: "maintenance", dismissible: true });
    }
  }, []);

  if (!banner || dismissed) return null;

  const isInfo = banner.type === "info";

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        width: "100%",
        background: isInfo ? "#EFF6FF" : AMBER_BG,
        borderBottom: `2px solid ${isInfo ? "#BFDBFE" : AMBER_BORDER}`,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: "var(--font-brand)",
        fontSize: 14,
        fontWeight: 500,
        color: NAVY,
        zIndex: 10001,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <span style={{ fontSize: 16 }}>{isInfo ? "ℹ️" : "🔧"}</span>
      <span style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
        {banner.message}
      </span>
      {banner.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notice"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#94A3B8",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
