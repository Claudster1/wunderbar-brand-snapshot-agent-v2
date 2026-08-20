// src/pdf/components/Section.tsx
// Suite section shell for PDF documents

import type { ReactNode } from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { SUITE_ACCENT_BRIGHT, SUITE_NAVY } from "@/components/results/suiteBrandTokens";

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Lato",
    fontSize: 9,
    fontWeight: 700,
    color: SUITE_ACCENT_BRIGHT,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  navyTitle: {
    fontFamily: "Lato",
    fontSize: 12,
    fontWeight: 700,
    color: SUITE_NAVY,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
});

export const Section = ({
  title,
  children,
  titleTone = "accent",
}: {
  title?: string;
  children: ReactNode;
  titleTone?: "accent" | "navy";
}) => (
  <View style={styles.section}>
    {title ? (
      <Text style={titleTone === "navy" ? styles.navyTitle : styles.title}>{title}</Text>
    ) : null}
    {children}
  </View>
);
