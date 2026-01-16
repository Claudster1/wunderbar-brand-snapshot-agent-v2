// src/pdf/components/SectionHeader.tsx
// Section header component for PDF documents

import { Text, StyleSheet } from "@react-pdf/renderer";
import { pdfTheme } from "../theme";

const styles = StyleSheet.create({
  header: {
    fontSize: pdfTheme.fontSizes.lg || 16,
    fontWeight: 700,
    color: pdfTheme.colors.navy || "#021859",
    marginBottom: pdfTheme.spacing.md || 12,
  },
});

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <Text style={styles.header}>{children}</Text>;
}
