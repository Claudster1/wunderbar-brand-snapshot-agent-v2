import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const s = StyleSheet.create({
  page: {
    padding: 44,
    fontFamily: "Helvetica",
    justifyContent: "center",
    backgroundColor: "#061E63",
  },
  panel: {
    borderRadius: 14,
    border: "1 solid rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 28,
    paddingHorizontal: 30,
  },
  eyebrow: {
    fontSize: 9,
    color: "#8CD7FF",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: 600,
    textAlign: "center",
    opacity: 0.95,
  },
  ruleWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
  },
  rule: {
    width: 74,
    height: 3,
    backgroundColor: pdfTheme.colors.blue,
    borderRadius: 999,
    opacity: 0.95,
  },
  title: {
    fontSize: 27,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.82,
    lineHeight: 1.55,
  },
  watermark: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 8,
    color: "#95A4CC",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
});

interface Props {
  title: string;
  subtitle?: string;
  label?: string;
  eyebrow?: string;
}

export function SectionDividerPage({ title, subtitle, label, eyebrow }: Props) {
  const displayLabel = label || eyebrow || "Section";
  return (
    <Page size="A4" style={s.page}>
      <View style={s.panel}>
        <Text style={s.eyebrow}>{displayLabel}</Text>
        <View style={s.ruleWrap}>
          <View style={s.rule} />
        </View>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={s.watermark}>Wunderbar Digital · Strategy System</Text>
    </Page>
  );
}
