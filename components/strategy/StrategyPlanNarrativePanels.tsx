"use client";

import {
  StrategyDomainSection,
  strategyDomainGradient,
} from "@/components/strategy/StrategyDomainSection";
import IcpPlaybookStructuredLayout from "@/components/strategy/IcpPlaybookStructuredLayout";
import SalesMarketingFlowVisual from "@/components/strategy/SalesMarketingFlowVisual";
import StrategyProseBody from "@/components/strategy/StrategyProseBody";
import {
  SUITE_BORDER,
  SUITE_FONT_UI,
  SUITE_INSIGHT_CARD_BASE,
  SUITE_INSIGHT_CARD_RAIL_LEFT,
  SUITE_NAVY,
  SUITE_TEXT_PRIMARY,
} from "@/components/results/suiteBrandTokens";
import type { StrategyNarrativeBlock, StrategyPlanSection } from "@/lib/strategy/strategyPlanExtract";

type Props = {
  sections: StrategyPlanSection[];
  /** 1-based index for the first panel (after optional Marketing Strategy block). Default 1. */
  firstOrdinal?: number;
  /** Which gradient in the rotation to start from (usually matches blocks above). Default 0. */
  firstGradientIndex?: number;
};

const ICP_PLAYBOOK_ACCENTS = [
  {
    rail: "#07B0F2",
    badgeBg: "rgba(7, 176, 242, 0.14)",
    badgeText: "#024E70",
    headerRule: "rgba(7, 176, 242, 0.35)",
    wash: "linear-gradient(180deg, #EEF9FF 0%, #FFFFFF 55%)",
  },
  {
    rail: "#6366F1",
    badgeBg: "rgba(99, 102, 241, 0.12)",
    badgeText: "#312E81",
    headerRule: "rgba(99, 102, 241, 0.32)",
    wash: "linear-gradient(180deg, #F5F3FF 0%, #FFFFFF 55%)",
  },
  {
    rail: "#0D9488",
    badgeBg: "rgba(13, 148, 136, 0.12)",
    badgeText: "#134E4A",
    headerRule: "rgba(13, 148, 136, 0.32)",
    wash: "linear-gradient(180deg, #ECFDF5 0%, #FFFFFF 55%)",
  },
] as const;

function icpPlaybookAccent(playbookIndex1Based: number) {
  return ICP_PLAYBOOK_ACCENTS[(Math.max(1, playbookIndex1Based) - 1) % ICP_PLAYBOOK_ACCENTS.length]!;
}

/** Replaces "ICP 1 of 3" style counters with standard tier language. */
function icpTierEyebrowLabel(index1Based: number): string {
  if (index1Based <= 1) return "Primary ICP";
  if (index1Based === 2) return "Secondary ICP";
  return "Additional ICP";
}

function isIcpPlaybookBlock(b: StrategyNarrativeBlock): boolean {
  return (
    b.visualVariant === "icp-playbook" ||
    b.title.trim().toLowerCase().startsWith("icp playbook —")
  );
}

function inferIcpPlaybookMeta(
  section: StrategyPlanSection,
  block: StrategyNarrativeBlock,
  blockIndex: number,
): { index: number } | null {
  if (!isIcpPlaybookBlock(block)) return null;
  const blocks = section.blocks ?? [];

  if (block.visualVariant === "icp-playbook" && typeof block.icpPlaybookIndex === "number") {
    return { index: block.icpPlaybookIndex };
  }
  let inferred = 0;
  for (let i = 0; i <= blockIndex; i++) {
    if (isIcpPlaybookBlock(blocks[i]!)) inferred += 1;
  }
  return { index: inferred };
}

/**
 * Strategy-only narrative panels: prose + evidence tables, Foundation-style numbered domain cards.
 */
export default function StrategyPlanNarrativePanels({
  sections,
  firstOrdinal = 1,
  firstGradientIndex = 0,
}: Props) {
  if (sections.length === 0) return null;

  const bodyText = SUITE_TEXT_PRIMARY;

  return (
    <div className="flex w-full max-w-full flex-col gap-10 md:gap-12">
      {sections.map((section, si) => {
        const ord = firstOrdinal + si;
        const sectionNumber = String(ord).padStart(2, "0");
        const gradient = strategyDomainGradient(firstGradientIndex + si);
        return (
          <StrategyDomainSection
            key={section.id}
            id={section.id}
            sectionNumber={sectionNumber}
            eyebrow="Strategic narrative"
            title={section.label}
            intro={typeof section.intro === "string" ? section.intro : ""}
            gradient={gradient}
          >
            {section.id === "strategy-sales-alignment" ? <SalesMarketingFlowVisual /> : null}
            <div
              className={
                section.id === "strategy-sales-alignment"
                  ? "flex flex-col gap-6 sm:gap-7"
                  : "flex flex-col gap-3 sm:gap-4"
              }
            >
              {(section.blocks ?? []).map((b, bi) => {
                const icpMeta = inferIcpPlaybookMeta(section, b, bi);
                if (icpMeta) {
                  const accent = icpPlaybookAccent(icpMeta.index);
                  return (
                    <div
                      key={`${section.id}-block-${bi}`}
                      style={{
                        ...SUITE_INSIGHT_CARD_BASE,
                        background: accent.wash,
                        borderLeft: `4px solid ${accent.rail}`,
                        padding: "20px 22px 22px",
                        boxShadow:
                          "0 2px 20px rgba(0, 0, 0, 0.055), 0 0 1px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 10px",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: accent.badgeText,
                          fontFamily: SUITE_FONT_UI,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            marginRight: 8,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: accent.badgeBg,
                            color: accent.badgeText,
                          }}
                        >
                          {icpTierEyebrowLabel(icpMeta.index)}
                        </span>
                        <span style={{ opacity: 0.92 }}>Go-to-market playbook</span>
                      </p>
                      <p
                        style={{
                          margin: 0,
                          paddingBottom: 12,
                          marginBottom: 4,
                          borderBottom: `1px solid ${accent.headerRule}`,
                          fontSize: 13,
                          fontWeight: 800,
                          letterSpacing: "0.02em",
                          color: SUITE_NAVY,
                          fontFamily: SUITE_FONT_UI,
                          lineHeight: 1.35,
                        }}
                      >
                        {b.title.replace(/^ICP playbook —\s*/i, "").trim() || b.title}
                      </p>
                      {b.icpPlaybookBody ? (
                        <IcpPlaybookStructuredLayout data={b.icpPlaybookBody} accent={{ rail: accent.rail }} />
                      ) : b.body.trim() ? (
                        <div className="mt-3">
                          <StrategyProseBody
                            text={b.body}
                            paragraphStyle={{
                              margin: 0,
                              fontSize: 15,
                              lineHeight: 1.625,
                              color: bodyText,
                              fontFamily: SUITE_FONT_UI,
                              whiteSpace: "pre-line",
                            }}
                            blockGapClassName="gap-3 sm:gap-4"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                }
                return (
                  <div
                    key={`${section.id}-block-${bi}`}
                    style={{
                      ...SUITE_INSIGHT_CARD_BASE,
                      ...SUITE_INSIGHT_CARD_RAIL_LEFT,
                      padding: "18px 20px 20px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        paddingBottom: 12,
                        marginBottom: 4,
                        borderBottom: "1px solid rgba(7, 176, 242, 0.14)",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        color: SUITE_NAVY,
                        fontFamily: SUITE_FONT_UI,
                      }}
                    >
                      {b.title}
                    </p>
                    {b.body.trim() ? (
                      <div className="mt-3">
                        <StrategyProseBody
                          text={b.body}
                          paragraphStyle={{
                            margin: 0,
                            fontSize: 15,
                            lineHeight: 1.625,
                            color: bodyText,
                            fontFamily: SUITE_FONT_UI,
                            whiteSpace: "pre-line",
                          }}
                          blockGapClassName="gap-3 sm:gap-4"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {section.tables?.length ? (
              <div className="flex flex-col gap-4">
                {section.tables.map((t) => {
                  const showReaderRowNote = t.rows.some((r) => Boolean(r.readerFriendly));
                  return (
                  <div key={t.caption}>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        color: SUITE_NAVY,
                        fontFamily: SUITE_FONT_UI,
                      }}
                    >
                      {t.caption}
                    </p>
                    {showReaderRowNote ? (
                      <p
                        className="mb-3 max-w-3xl text-[12px] leading-relaxed text-brand-muted sm:text-[13px]"
                        style={{ fontFamily: SUITE_FONT_UI }}
                      >
                        The first line in each row is the detail your marketing lead will use. When a second line
                        appears, it is optional simpler wording for founders, finance, or outside partners—skip it if you
                        do not need it.
                      </p>
                    ) : null}
                    <div
                      className="overflow-hidden"
                      style={{
                        ...SUITE_INSIGHT_CARD_BASE,
                        ...SUITE_INSIGHT_CARD_RAIL_LEFT,
                        padding: 0,
                      }}
                    >
                      {t.rows.map((row, i) => (
                        <div
                          key={`${t.caption}-${i}`}
                          className="grid gap-0"
                          style={{
                            gridTemplateColumns: "minmax(140px, 0.35fr) 1fr",
                            borderBottom:
                              i < t.rows.length - 1 ? `1px solid ${SUITE_BORDER}` : undefined,
                          }}
                        >
                          <div
                            className="text-xs font-semibold leading-snug text-brand-navy sm:text-[13px]"
                            style={{
                              padding: "12px 14px",
                              background: "linear-gradient(180deg, #F0F4FA 0%, #F5F7FA 100%)",
                              fontFamily: SUITE_FONT_UI,
                            }}
                          >
                            {row.label}
                          </div>
                          <div
                            className="whitespace-pre-line text-sm leading-relaxed sm:text-[15px]"
                            style={{
                              padding: "12px 14px",
                              background: "#FFFFFF",
                              color: bodyText,
                              fontFamily: SUITE_FONT_UI,
                            }}
                          >
                            {row.value}
                            {row.readerFriendly ? (
                              <p
                                className="mt-2.5 border-t border-slate-200/90 pt-2.5 text-[12px] leading-relaxed text-brand-muted sm:text-[13px]"
                                style={{ fontFamily: SUITE_FONT_UI }}
                              >
                                <span className="font-semibold text-brand-navy/75">Briefing phrasing — </span>
                                {row.readerFriendly}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
                })}
              </div>
            ) : null}
          </StrategyDomainSection>
        );
      })}
    </div>
  );
}
