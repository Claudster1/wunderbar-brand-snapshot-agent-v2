"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getPersistedEmail } from "@/lib/persistEmail";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const SUB = "#5A6B7E";
const BORDER = "#D6DFE8";
const WHITE = "#FFFFFF";
const GREEN = "#22C55E";

interface ShareButtonProps {
  reportId: string;
  documentType?: string;
  tier: string;
  label?: string;
  variant?: "icon" | "text";
}

export function ShareButton({
  reportId,
  documentType = "report",
  tier,
  label,
  variant = "icon",
}: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleShare = useCallback(async () => {
    const email = getPersistedEmail();
    if (!email) {
      setState("error");
      timerRef.current = setTimeout(() => setState("idle"), 2500);
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          documentType,
          tier: tier.replace("_", "-"),
          email,
          expiryDays: 7,
          label,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const { shareUrl } = await res.json();

      if (navigator.share && /Mobi/i.test(navigator.userAgent)) {
        await navigator.share({
          title: label || "WunderBrand Report",
          url: shareUrl,
        });
        setState("idle");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setState("copied");
        timerRef.current = setTimeout(() => setState("idle"), 2500);
      }
    } catch {
      setState("error");
      timerRef.current = setTimeout(() => setState("idle"), 2500);
    }
  }, [reportId, documentType, tier, label]);

  if (variant === "text") {
    return (
      <button
        onClick={handleShare}
        disabled={state === "loading"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 12px",
          borderRadius: 5,
          border: `1px solid ${state === "copied" ? GREEN : BORDER}`,
          background: state === "copied" ? "#F0FFF4" : WHITE,
          color: state === "copied" ? GREEN : state === "error" ? "#DC2626" : NAVY,
          fontWeight: 600,
          fontSize: 12,
          cursor: state === "loading" ? "wait" : "pointer",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          opacity: state === "loading" ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {state === "copied" ? (
          <>
            <CheckIcon /> Copied
          </>
        ) : state === "error" ? (
          "Failed"
        ) : (
          <>
            <ShareIcon size={12} /> Share
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === "loading"}
      title={state === "copied" ? "Link copied!" : "Share link"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 6,
        border: `1.5px solid ${state === "copied" ? GREEN : BORDER}`,
        background: state === "copied" ? "#F0FFF4" : WHITE,
        color: state === "copied" ? GREEN : state === "error" ? "#DC2626" : SUB,
        cursor: state === "loading" ? "wait" : "pointer",
        transition: "all 0.15s",
        opacity: state === "loading" ? 0.6 : 1,
        padding: 0,
      }}
    >
      {state === "copied" ? <CheckIcon /> : <ShareIcon size={16} />}
    </button>
  );
}

function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: size, height: size }}>
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
