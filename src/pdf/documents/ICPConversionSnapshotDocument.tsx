/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";
import type { BlueprintEngineOutput } from "../types/blueprintReport";
import { DisclaimerPage } from "../components/DisclaimerPage";

const LOGO_URL =
  "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

const s = StyleSheet.create({
  page: { padding: 42, paddingBottom: 66, fontFamily: "Helvetica", fontSize: 10, color: "#2D3A4A", lineHeight: 1.6 },
  cover: { padding: 42, fontFamily: "Helvetica", justifyContent: "center", alignItems: "center", backgroundColor: pdfTheme.colors.navy },
  logo: { width: 100, marginBottom: 30, opacity: 0.9 },
  coverTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  coverSub: { fontSize: 12, color: pdfTheme.colors.aqua, textAlign: "center", marginBottom: 24 },
  coverMeta: { fontSize: 9, color: "#FFFFFF", textAlign: "center", opacity: 0.7, marginTop: 3 },
  h1: { fontSize: 18, fontWeight: "bold", color: "#021859", marginBottom: 8, marginTop: 14 },
  h2: { fontSize: 12, fontWeight: "bold", color: "#021859", marginBottom: 5, marginTop: 10 },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 6, color: "#2D3A4A" },
  small: { fontSize: 9, color: "#6B7280", lineHeight: 1.45 },
  card: { backgroundColor: "#F8FBFF", borderRadius: 8, padding: 12, marginBottom: 10, border: "1 solid #E2EAF5" },
  accentCard: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, marginBottom: 10, borderLeft: `3 solid ${pdfTheme.colors.blue}`, border: "1 solid #D9E8FF" },
  bullet: { fontSize: 10, lineHeight: 1.55, marginBottom: 3, paddingLeft: 10 },
  footer: { position: "absolute", bottom: 18, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9CA3AF" },
});

interface Props {
  data: BlueprintEngineOutput;
  brandName: string;
}

export function ICPConversionSnapshotDocument({ data, brandName }: Props) {
  const framework = data.icpConversionIntelligenceFramework;
  const profiles = (framework?.conversionProfile || []).slice(0, 2);
  const hooks = (framework?.hookTypePerformance || []).slice(0, 2);
  const matrix = (framework?.contentTypeConversionMatrix || []).slice(0, 8);

  const fallbackProfiles =
    profiles.length > 0
      ? profiles
      : [
          {
            icpTier: "Primary ICP",
            buyingCycleLength: "30-60 days",
            primaryConversionBarrier: "Unclear proof that implementation will work in their current context.",
            decisionTrigger: "Sees role-specific roadmap + comparable proof.",
            conversionBehaviorPattern: "Consumes one insight asset and one proof asset before booking.",
          },
        ];

  return (
    <Document>
      <Page size="A4" style={s.cover}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={LOGO_URL} style={s.logo} />
        <Text style={s.coverTitle}>ICP Conversion Snapshot</Text>
        <Text style={s.coverSub}>{brandName} — Blueprint conversion quickview</Text>
        <Text style={{ ...s.coverMeta, marginTop: 26 }}>
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </Text>
        <Text style={{ ...s.coverMeta, marginTop: 34, fontSize: 8 }}>
          Upgrade to Blueprint+ for the full ICP Conversion Intelligence Framework
        </Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ICP Conversion Snapshot — {brandName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <Text style={s.h1}>Conversion Profile (Lite)</Text>
        {(framework?.overview || "").trim() ? (
          <View style={s.accentCard}>
            <Text style={s.body}>{framework?.overview}</Text>
          </View>
        ) : null}
        {fallbackProfiles.map((row, i) => (
          <View key={`profile-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier}</Text>
            <Text style={s.body}>Buying cycle: {row.buyingCycleLength}</Text>
            <Text style={s.body}>Top barrier: {row.primaryConversionBarrier}</Text>
            <Text style={s.body}>Decision trigger: {row.decisionTrigger}</Text>
            <Text style={s.small}>Pattern: {row.conversionBehaviorPattern}</Text>
          </View>
        ))}

        <Text style={s.h1}>Hook + CTA Guidance</Text>
        {(hooks.length > 0 ? hooks : []).map((row, i) => (
          <View key={`hook-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>{row.icpTier}</Text>
            {row.reliableHookTypes?.slice(0, 2).map((item, j) => (
              <Text key={`good-${j}`} style={s.bullet}>• Use: {item.hookType} — {item.whyItConverts}</Text>
            ))}
            {row.hookTypesToAvoid?.slice(0, 1).map((item, j) => (
              <Text key={`bad-${j}`} style={s.bullet}>• Not this: {item.hookType} — {item.whyToAvoid}</Text>
            ))}
          </View>
        ))}
        {hooks.length === 0 ? (
          <View style={s.card}>
            <Text style={s.bullet}>• Use data-led insights and peer social proof for consideration-stage conversion.</Text>
            <Text style={s.bullet}>• Avoid generic hype and abstract claims without proof.</Text>
          </View>
        ) : null}

        <Text style={s.h1}>Top Content Matrix Cells</Text>
        {(matrix.length > 0 ? matrix : []).map((row, i) => (
          <View key={`matrix-${i}`} style={s.card} wrap={false}>
            <Text style={s.h2}>
              {row.icpTier} — {row.funnelStage}
            </Text>
            <Text style={s.body}>Best content type: {row.highestConvertingContentType}</Text>
            <Text style={s.small}>Lead pillar: {row.leadMessagePillar} | CTA: {row.convertingCTA}</Text>
          </View>
        ))}
        {matrix.length === 0 ? (
          <View style={s.card}>
            <Text style={s.bullet}>• Awareness: Insight-led authority content + soft CTA</Text>
            <Text style={s.bullet}>• Consideration: Proof-backed comparison content + plan CTA</Text>
            <Text style={s.bullet}>• Decision: Offer + evidence page + implementation CTA</Text>
          </View>
        ) : null}
      </Page>

      <DisclaimerPage tier="blueprint" />
    </Document>
  );
}

