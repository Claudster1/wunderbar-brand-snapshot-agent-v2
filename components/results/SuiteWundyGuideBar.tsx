"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import type { ResultsTab } from "@/components/results/tabConfig";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_CONTENT_MAX_PX,
  SUITE_FONT_UI,
  SUITE_RADIUS_BUTTON,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";

const WUNDY_AVATAR = "/assets/og/wundy-outline.svg";

const TAB_HINTS: Partial<Record<ResultsTab, string>> = {
  results: "Good place to ask what your scores mean and what to tackle first.",
  foundation: "Ask how a Foundation section applies to your site, deck, or team.",
  strategy: "Ask how to read a strategy block or what to prioritize next quarter.",
  standards: "Ask how a Brand Standards check should show up before publish.",
  activation: "Ask how to read a channel row, owner, or milestone.",
  workbook: "Ask how to phrase a refinement or what to save before exporting.",
  downloads: "Ask which export fits stakeholders or how regeneration works.",
};

type Props = {
  activeTab: ResultsTab;
};

export function openWundyChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wundy:ask", { detail: { open: true } }));
}

/**
 * In-suite pointer to Wundy™ so users discover the floating companion without scrolling past the whole report.
 */
export default function SuiteWundyGuideBar({ activeTab }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("wb-suite-wundy-guide") === "1";
  });

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem("wb-suite-wundy-guide", "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (dismissed) return null;

  const hint = TAB_HINTS[activeTab];

  return (
    <div
      style={{
        maxWidth: SUITE_CONTENT_MAX_PX,
        margin: "0 auto 12px",
        padding: "0 min(24px, 4vw)",
        fontFamily: SUITE_FONT_UI,
      }}
    >
      <div
        className="flex flex-col gap-3 rounded-xl border bg-white/95 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
        style={{ borderColor: SUITE_BORDER }}
        role="region"
        aria-label="Wundy report companion"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Image
            src={WUNDY_AVATAR}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full border object-cover"
            style={{ borderColor: SUITE_BORDER, background: "#F0F9FF" }}
          />
          <div className="min-w-0">
            <p className="m-0 text-sm font-semibold leading-snug" style={{ color: SUITE_TEXT_PRIMARY }}>
              Wundy™ — your in-report guide
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted sm:text-[13px]">
              Open the chat in the lower-right anytime to clarify scores, a tab, or your next step. The detailed report
              stays the source of truth—Wundy helps you navigate it.
            </p>
            {hint ? (
              <p className="mt-1.5 text-xs leading-relaxed text-brand-navy/80 sm:text-[13px]">
                <span className="font-semibold text-brand-navy">On this tab: </span>
                {hint}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={() => openWundyChat()}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            style={{ backgroundColor: SUITE_ACCENT_BRIGHT, borderRadius: SUITE_RADIUS_BUTTON, fontFamily: SUITE_FONT_UI }}
          >
            Open Wundy™
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium text-brand-muted underline-offset-2 hover:text-brand-navy hover:underline"
            style={{ fontFamily: SUITE_FONT_UI }}
          >
            Hide for this session
          </button>
        </div>
      </div>
    </div>
  );
}
