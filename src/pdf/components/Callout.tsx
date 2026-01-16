// src/pdf/components/Callout.tsx
// Callout/emphasis block component for PDF documents

import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  container: {
    padding: pdfTheme.spacing.md || 12,
    backgroundColor: "#F0F9FF",
    borderLeft: `3px solid ${pdfTheme.colors.blue || "#07B0F2"}`,
    marginBottom: pdfTheme.spacing.md || 12,
    borderRadius: 4,
  },
  text: {
    fontSize: pdfTheme.fontSizes.sm || 11,
    color: pdfTheme.colors.midnight || "#0C1526",
    lineHeight: 1.5,
  },
});

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}
