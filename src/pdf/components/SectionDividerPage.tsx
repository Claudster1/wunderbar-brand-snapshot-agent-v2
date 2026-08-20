import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { SUITE_ACCENT_BRIGHT, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const s = StyleSheet.create({
  page: {
    padding: 44,
    fontFamily: "Lato",
    justifyContent: "center",
    backgroundColor: SUITE_NAVY,
  },
  panel: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 28,
    paddingHorizontal: 30,
  },
  eyebrow: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    color: SUITE_ACCENT_BRIGHT,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "center",
  },
  ruleWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
  },
  rule: {
    width: 74,
    height: 3,
    backgroundColor: SUITE_ACCENT_BRIGHT,
    borderRadius: 999,
  },
  title: {
    fontFamily: "Lato",
    fontSize: 26,
    fontWeight: 900,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 1.2,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: "Lato",
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.82,
    lineHeight: 1.55,
  },
  watermark: {
    marginTop: 24,
    textAlign: "center",
    fontFamily: "Lato",
    fontSize: 8,
    fontWeight: 600,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
});

interface Props {
  title: string;
  subtitle?: string;
  label?: string;
  eyebrow?: string;
  /** Optional brand accent from client palette (validated hex) — aligns divider with company PDF styling. */
  accentHex?: string;
}

export function SectionDividerPage({ title, subtitle, label, eyebrow, accentHex }: Props) {
  const displayLabel = label || eyebrow || "Section";
  return (
    <Page size="A4" style={s.page}>
      <View style={s.panel}>
        <Text style={s.eyebrow}>{displayLabel}</Text>
        <View style={s.ruleWrap}>
          <View style={[s.rule, accentHex ? { backgroundColor: accentHex } : {}]} />
        </View>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={s.watermark}>Wunderbar Digital · Strategy System</Text>
    </Page>
  );
}
