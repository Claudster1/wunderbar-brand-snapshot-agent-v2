"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_MUTED,
  SUITE_NAVY,
} from "@/components/results/suiteBrandTokens";

const NAVY = SUITE_NAVY;
const BLUE = SUITE_ACCENT_BRIGHT;
const MID_GRAY = SUITE_MUTED;
const BORDER = SUITE_BORDER;

const POPOVER_BODY =
  "Channel playbooks work best when your team shares the same view of who you sell to (ICPs and personas), how buyers move through the journey, and how you win against alternatives. Those live in separate foundation briefs so this page stays focused on execution—open them when you need that context.";

export type AudienceFoundationLink = { label: string; href: string };

type Props = {
  links: AudienceFoundationLink[];
  /** Shorter label next to the control (Activation table rows). */
  variant?: "compact" | "panel";
};

export default function AudienceFoundationInfoTrigger({ links, variant = "compact" }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (links.length === 0) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: variant === "panel" ? 10 : 8,
        flexWrap: "wrap",
      }}
    >
      {variant === "compact" ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: MID_GRAY,
            letterSpacing: "0.03em",
          }}
        >
          Foundation
        </span>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? headingId : undefined}
        aria-label="What the audience foundation is and where to open those plans"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `1px solid ${open ? BLUE : BORDER}`,
          background: open ? "#E8F6FE" : "#FFFFFF",
          color: NAVY,
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontStyle: "italic",
          lineHeight: 1,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        i
      </button>
      {open ? (
        <div
          id={headingId}
          role="dialog"
          aria-labelledby={`${headingId}-title`}
          style={{
            position: "absolute",
            zIndex: 200,
            top: "100%",
            left: variant === "panel" ? "auto" : 0,
            right: variant === "panel" ? 0 : "auto",
            marginTop: 8,
            minWidth: 272,
            maxWidth: "min(340px, calc(100vw - 48px))",
            padding: "12px 14px",
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: "#FFFFFF",
            boxShadow: "0 10px 28px rgba(2, 24, 89, 0.14)",
          }}
        >
          <p
            id={`${headingId}-title`}
            style={{ margin: 0, fontSize: 12, fontWeight: 800, color: NAVY }}
          >
            Audience &amp; strategy foundation
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: MID_GRAY, lineHeight: 1.55 }}>{POPOVER_BODY}</p>
          <p style={{ margin: "10px 0 6px", fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: "0.04em" }}>
            Open a brief
          </p>
          <ul className="strategy-suite-ul" style={{ margin: 0, fontSize: 12, color: NAVY, lineHeight: 1.5 }}>
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  style={{ fontWeight: 700, color: BLUE, textDecoration: "underline" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
