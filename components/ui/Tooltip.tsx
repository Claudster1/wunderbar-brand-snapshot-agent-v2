"use client";

import { useState } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

/** Light panel reads better on grey backgrounds and avoids clipping when `side="bottom"` under overflow parents. */
const TOOLTIP_PANEL =
  "absolute left-1/2 z-[100] -translate-x-1/2 max-w-[min(280px,calc(100vw-1.5rem))] rounded-lg border border-slate-200/95 bg-white px-3 py-2.5 text-left text-[13px] leading-[1.45] text-slate-700 shadow-[0_10px_40px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.04)]";

export function Tooltip({ content, children, side = "top", className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`${TOOLTIP_PANEL} ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/** Small (i) icon that shows a tooltip on hover — brand blue; keep ~8px+ from preceding text via parent `gap-2` or `ms-2`. */
export function TooltipIcon({
  content,
  className = "",
  side = "top",
}: {
  content: React.ReactNode;
  /** Merged onto the outer tooltip wrapper (e.g. `ms-2` when the icon follows plain text with no flex gap). */
  className?: string;
  /** Use `"bottom"` when the trigger sits just inside a parent with `overflow-hidden` (e.g. card headers). */
  side?: "top" | "bottom";
}) {
  return (
    <Tooltip content={content} side={side} className={`shrink-0 ${className}`.trim()}>
      <span
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-brand-blue text-[10px] font-semibold leading-none text-white shadow-sm ring-1 ring-black/[0.06] transition-colors hover:bg-brand-blueHover"
        aria-label="More information"
      >
        i
      </span>
    </Tooltip>
  );
}
