"use client";

import type { CSSProperties, ReactNode } from "react";

const FN_DRAFT_EYEBROW = "text-[14px] font-semibold tracking-[0.08em]";

function safeDisplayString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export const STRATEGY_DOMAIN_GRADIENTS = [
  "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)",
  "linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%)",
  "linear-gradient(135deg, #FFFFFF 0%, #F5F8FF 100%)",
  "linear-gradient(135deg, #FFFFFF 0%, #F3FCFB 100%)",
  "linear-gradient(135deg, #FFFFFF 0%, #F3FAFD 100%)",
  "linear-gradient(135deg, #FFFFFF 0%, #FAF7FF 100%)",
] as const;

export function strategyDomainGradient(index: number): string {
  return STRATEGY_DOMAIN_GRADIENTS[index % STRATEGY_DOMAIN_GRADIENTS.length] ?? STRATEGY_DOMAIN_GRADIENTS[0];
}

type Props = {
  id: string;
  sectionNumber: string;
  eyebrow: string;
  title: string;
  intro?: string | null;
  gradient: string;
  children: ReactNode;
  /** e.g. workbook button, aligned with the title block on wide screens */
  headerAside?: ReactNode;
  sectionStyle?: CSSProperties;
};

/**
 * Mirrors Foundation `DomainSection` chrome: large ordinal, eyebrow, `bs-h2`, intro, gradient card shell.
 */
export function StrategyDomainSection({
  id,
  sectionNumber,
  eyebrow,
  title,
  intro,
  gradient,
  children,
  headerAside,
  sectionStyle,
}: Props) {
  const eyebrowText = safeDisplayString(eyebrow);
  const titleText = safeDisplayString(title);
  const introText = safeDisplayString(intro);
  const ordinalText = safeDisplayString(sectionNumber);

  return (
    <section
      id={id}
      className="bs-card rounded-2xl p-7 sm:p-8 lg:p-10 shadow-[0_10px_40px_rgba(2,24,89,0.05)] ring-1 ring-slate-900/[0.04]"
      style={{ background: gradient, scrollMarginTop: 120, ...sectionStyle }}
    >
      <div
        className="mb-7 flex flex-col gap-5 pb-5 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:pb-6"
        style={{ boxShadow: "0 1px 0 rgba(2, 24, 89, 0.07)" }}
      >
        <div className="flex min-w-0 flex-1 items-start gap-5">
          <div className="min-w-[44px] text-3xl font-semibold leading-none tabular-nums text-brand-blue sm:text-4xl">
            {ordinalText}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`mb-2 ${FN_DRAFT_EYEBROW} text-brand-navy`}>{eyebrowText}</p>
            <h3 className="bs-h2 mb-3">{titleText}</h3>
            {introText ? (
              <p className="max-w-3xl text-sm leading-relaxed text-brand-muted sm:text-base">{introText}</p>
            ) : null}
          </div>
        </div>
        {headerAside ? <div className="shrink-0 self-start sm:pt-1">{headerAside}</div> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-6 sm:gap-7">{children}</div>
    </section>
  );
}
