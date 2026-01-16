// src/pdf/components/InsightBlock.tsx
// Reusable insight block component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: pdfTheme.spacing.lg,
    backgroundColor: "#F8FAFC",
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

export const InsightBlock = ({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: React.ReactNode;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {children ? (
      <Text style={styles.text}>{children}</Text>
    ) : text ? (
      <Text style={styles.text}>{text}</Text>
    ) : null}
  </View>
);
