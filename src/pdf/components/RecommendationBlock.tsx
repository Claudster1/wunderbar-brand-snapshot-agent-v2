// src/pdf/components/RecommendationBlock.tsx
// Reusable recommendation block component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: pdfTheme.spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    border: `1px solid ${pdfTheme.colors.border}`,
  },
  title: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.md,
    fontWeight: 600,
    color: pdfTheme.colors.navy,
    marginBottom: pdfTheme.spacing.sm,
  },
  text: {
    fontFamily: "Inter",
    fontSize: pdfTheme.fontSizes.base,
    color: pdfTheme.colors.midnight,
    lineHeight: 1.5,
  },
});

export const RecommendationBlock = ({
  title,
  text,
}: {
  title: string;
  text: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);
