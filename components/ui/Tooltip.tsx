"use client";

import { useState } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

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
          className={`
            absolute left-1/2 z-50 -translate-x-1/2 max-w-[260px] rounded-lg bg-brand-navy px-3 py-2.5 text-[13px] leading-[1.4] text-white shadow-lg border border-white/10
            ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"}
          `}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/** Small (i) icon that shows a tooltip on hover */
export function TooltipIcon({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip content={content}>
      <span
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-brand-muted text-[10px] font-medium text-white hover:bg-brand-navy"
        aria-label="More information"
      >
        i
      </span>
    </Tooltip>
  );
}
