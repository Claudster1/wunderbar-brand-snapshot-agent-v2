import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: pdfTheme.colors.navy,
  },
  eyebrow: {
    fontSize: 10,
    color: pdfTheme.colors.aqua,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    maxWidth: 460,
  },
  subtitle: {
    fontSize: 10,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.78,
    maxWidth: 420,
    lineHeight: 1.5,
  },
  rule: {
    width: 56,
    height: 2,
    backgroundColor: pdfTheme.colors.aqua,
    marginBottom: 16,
    opacity: 0.9,
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
      <Text style={s.eyebrow}>{displayLabel}</Text>
      <View style={s.rule} />
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </Page>
  );
}
