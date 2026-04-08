/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { DisclaimerPage } from "../components/DisclaimerPage";
import { SectionDividerPage } from "../components/SectionDividerPage";

const LOGO_URL =
  "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const s = StyleSheet.create({
  page: {
    padding: 42,
    paddingBottom: 66,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#2D3A4A",
    lineHeight: 1.6,
  },
  cover: {
    padding: 42,
    fontFamily: "Helvetica",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: pdfTheme.colors.navy,
  },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 19, fontWeight: "bold", color: "#021859", marginBottom: 8 },
  h2: { fontSize: 13, fontWeight: "bold", color: "#021859", marginBottom: 5, marginTop: 10 },
  body: { fontSize: 10, marginBottom: 5, lineHeight: 1.6, color: "#2D3A4A" },
  card: {
    border: "1 solid #E2EAF5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#F8FBFF",
  },
  label: {
    fontSize: 8,
    color: "#0D5BD7",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props {
  data: BlueprintEngineOutput;
  brandName: string;
}

function lines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\n|\. /)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function BattleCardsDocument({ data, brandName }: Props) {
  const players = data.competitivePositioning?.players ?? [];
  const fallbackDifferentiation =
    data.competitivePositioning?.differentiationSummary || data.brandFoundation?.differentiationNarrative || "";
  const vulnerabilities = data.competitivePositioning?.vulnerabilities || "";
  const salesRef = data.salesConversationGuide?.conversion_intelligence_reference;

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>Sales Battle Cards</Text>
        <Text style={s.coverSub}>{brandName} — WunderBrand Blueprint+™</Text>
        <Text style={s.coverMeta}>
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>CONFIDENTIAL — Internal sales enablement</Text>
      </Page>

      <SectionDividerPage
        label="Section"
        title="Competitive Conversations"
        subtitle="How to position, differentiate, and win in live buyer conversations."
      />

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Battle Cards — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>Battle Cards</Text>
        {salesRef ? (
          <View style={s.card}>
            <Text style={s.label}>ICP Conversion Intelligence Link</Text>
            <Text style={s.body}>
              {salesRef.icpTier} | {salesRef.funnelStage} | {salesRef.matrixCell}
            </Text>
          </View>
        ) : null}
        <Text style={s.body}>
          Use these cards in live sales and marketing conversations. Each one translates competitive context into
          "what to say", "what to avoid", and "how we win" guidance.
        </Text>

        {players.length > 0 ? (
          players.map((player, index) => (
            <View key={`${player.name}-${index}`} style={s.card} wrap={false}>
              <Text style={s.h2}>{player.name || `Competitor ${index + 1}`}</Text>

              <Text style={s.label}>Position Snapshot</Text>
              <Text style={s.body}>{player.narrative || "No positioning note provided."}</Text>

              <Text style={s.label}>Likely Angle</Text>
              {lines(player.narrative || fallbackDifferentiation).map((line, i) => (
                <Text key={i} style={s.body}>• {line}</Text>
              ))}

              <Text style={s.label}>How We Win</Text>
              {lines(fallbackDifferentiation).length > 0 ? (
                lines(fallbackDifferentiation).map((line, i) => (
                  <Text key={i} style={s.body}>• {line}</Text>
                ))
              ) : (
                <Text style={s.body}>• Reinforce our differentiated value narrative with concrete proof.</Text>
              )}

              <Text style={s.label}>Objection Response Cue</Text>
              <Text style={s.body}>
                Lead with outcomes and proof, then contrast with our positioning instead of attacking competitors.
              </Text>
            </View>
          ))
        ) : (
          <View style={s.card}>
            <Text style={s.h2}>Competitive Context</Text>
            <Text style={s.body}>{fallbackDifferentiation || "Competitive differentiation details are limited in this report."}</Text>
          </View>
        )}

        {!!vulnerabilities && (
          <View style={s.card}>
            <Text style={s.h2}>Watchouts</Text>
            {lines(vulnerabilities).map((line, i) => (
              <Text key={i} style={s.body}>• {line}</Text>
            ))}
          </View>
        )}
      </Page>

      <DisclaimerPage tier="blueprint_plus" />
    </Document>
  );
}
